import { createFileRoute } from "@tanstack/react-router";

// Server-to-server payment confirmation from NETOPIA. This endpoint is the ONLY
// place where an order becomes paid. Notifications are idempotent: each one is
// recorded in payment_events keyed by (provider, event_key) and duplicates are
// acknowledged without re-applying anything.
export const Route = createFileRoute("/api/public/netopia/ipn")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();

        let payload: {
          order?: { orderID?: string };
          payment?: { ntpID?: string; status?: number; amount?: number; currency?: string };
          error?: { code?: string; message?: string };
          orderID?: string;
          ntpID?: string;
          status?: number;
        };
        try {
          payload = JSON.parse(rawBody) as typeof payload;
        } catch {
          return new Response(JSON.stringify({ errorType: 1, errorMessage: "Invalid payload" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const { readNetopiaConfig, mapNetopiaStatus } = await import("@/lib/netopia.server");
        const config = readNetopiaConfig();
        if (!config) {
          return new Response(
            JSON.stringify({ errorType: 1, errorMessage: "Payments not configured" }),
            { status: 503, headers: { "content-type": "application/json" } },
          );
        }

        // NETOPIA signs notifications with the POS signature header.
        const signature =
          request.headers.get("verification-token") ??
          request.headers.get("x-netopia-signature") ??
          request.headers.get("authorization") ??
          "";
        const orderNumber = payload.order?.orderID ?? payload.orderID ?? "";
        const providerPaymentId = payload.payment?.ntpID ?? payload.ntpID ?? "";
        const status = payload.payment?.status ?? payload.status ?? null;

        if (!orderNumber || !providerPaymentId) {
          return new Response(
            JSON.stringify({ errorType: 1, errorMessage: "Missing order reference" }),
            { status: 400, headers: { "content-type": "application/json" } },
          );
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("id, order_number, total_cents, payment_status")
          .eq("order_number", orderNumber)
          .maybeSingle();

        if (!order) {
          return new Response(JSON.stringify({ errorType: 1, errorMessage: "Unknown order" }), {
            status: 404,
            headers: { "content-type": "application/json" },
          });
        }

        // Idempotency: identical notifications are ignored after the first one.
        const eventKey = `${providerPaymentId}:${status ?? "none"}`;
        const { error: eventError } = await supabaseAdmin.from("payment_events").insert({
          order_id: order.id,
          provider: "netopia",
          event_key: eventKey,
          payload: { ...payload, signaturePresent: signature.length > 0 } as never,
        });

        if (eventError) {
          // Unique violation => duplicate notification, already applied.
          return new Response(JSON.stringify({ errorType: 0, errorMessage: "Duplicate" }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        const mapped = mapNetopiaStatus(status);
        const amountMatches =
          payload.payment?.amount == null ||
          Math.round(payload.payment.amount * 100) === order.total_cents;

        const paymentStatus = amountMatches ? mapped.payment : "failed";
        const orderStatus = amountMatches ? mapped.order : "failed";

        await supabaseAdmin
          .from("payments")
          .update({
            provider_payment_id: providerPaymentId,
            status: paymentStatus,
            amount_cents: order.total_cents,
            error_code: payload.error?.code ?? null,
            error_message: amountMatches ? (payload.error?.message ?? null) : "Amount mismatch",
            raw_payload: payload as never,
          })
          .eq("order_id", order.id);

        await supabaseAdmin
          .from("orders")
          .update({ payment_status: paymentStatus, status: orderStatus })
          .eq("id", order.id);

        return new Response(JSON.stringify({ errorType: 0, errorCode: 0, errorMessage: "OK" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
