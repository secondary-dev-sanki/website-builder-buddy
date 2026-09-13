import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SHIPPING_FLAT_CENTS } from "./site";

const checkoutSchema = z.object({
  email: z.string().trim().email().max(255),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(40),
  addressLine1: z.string().trim().min(4).max(200),
  addressLine2: z.string().trim().max(200).optional().default(""),
  city: z.string().trim().min(2).max(120),
  county: z.string().trim().min(2).max(120),
  postalCode: z.string().trim().min(4).max(20),
  notes: z.string().trim().max(1000).optional().default(""),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;

export type CheckoutResult =
  | { ok: true; orderNumber: string; accessToken: string; redirectUrl: string | null }
  | { ok: false; error: string };

export const createOrderAndStartPayment = createServerFn({ method: "POST" })
  .inputValidator((data: CheckoutInput) => checkoutSchema.parse(data))
  .handler(async ({ data }): Promise<CheckoutResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const productIds = data.items.map((item) => item.productId);
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, slug, price_cents, stock, in_stock, is_active")
      .in("id", productIds);

    if (productsError) return { ok: false, error: "Could not load products." };

    const lines = data.items.map((item) => {
      const product = products?.find((row) => row.id === item.productId);
      if (!product || !product.is_active || !product.in_stock) return null;
      return {
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        unit_price_cents: product.price_cents,
        quantity: item.quantity,
        line_total_cents: product.price_cents * item.quantity,
      };
    });

    if (lines.some((line) => line === null)) {
      return { ok: false, error: "One of the products is no longer available." };
    }

    const orderLines = lines as NonNullable<(typeof lines)[number]>[];
    const subtotalCents = orderLines.reduce((total, line) => total + line.line_total_cents, 0);
    const shippingCents = SHIPPING_FLAT_CENTS;
    const totalCents = subtotalCents + shippingCents;

    const orderNumber = `CRN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        status: "pending",
        payment_status: "pending",
        email: data.email,
        full_name: data.fullName,
        phone: data.phone,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2 || null,
        city: data.city,
        county: data.county,
        postal_code: data.postalCode,
        country: "RO",
        notes: data.notes || null,
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        total_cents: totalCents,
      })
      .select("id, order_number, access_token")
      .single();

    if (orderError || !order) return { ok: false, error: "Could not create the order." };

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
      orderLines.map((line) => ({ ...line, order_id: order.id })),
    );
    if (itemsError) return { ok: false, error: "Could not save the order contents." };

    const { readNetopiaConfig, startNetopiaPayment } = await import("./netopia.server");
    const config = readNetopiaConfig();

    const { data: payment } = await supabaseAdmin
      .from("payments")
      .insert({
        order_id: order.id,
        provider: "netopia",
        environment: config?.environment ?? "sandbox",
        status: config ? "initiated" : "unconfigured",
        amount_cents: totalCents,
      })
      .select("id")
      .single();

    if (!config) {
      // No NETOPIA credentials yet: the order is recorded and left awaiting payment.
      return {
        ok: true,
        orderNumber: order.order_number,
        accessToken: order.access_token,
        redirectUrl: null,
      };
    }

    const origin = process.env["SITE_ORIGIN"] ?? "";
    const [firstName, ...rest] = data.fullName.split(" ");

    try {
      const result = await startNetopiaPayment(config, {
        orderNumber: order.order_number,
        amountCents: totalCents,
        currency: "RON",
        description: `Creionescu order ${order.order_number}`,
        redirectUrl: `${origin}/payment/return?order=${order.order_number}&token=${order.access_token}`,
        notifyUrl: `${origin}/api/public/netopia/ipn`,
        billing: {
          email: data.email,
          phone: data.phone,
          firstName: firstName ?? data.fullName,
          lastName: rest.join(" ") || firstName || data.fullName,
          city: data.city,
          country: "Romania",
          county: data.county,
          postalCode: data.postalCode,
          details: [data.addressLine1, data.addressLine2].filter(Boolean).join(", "),
        },
      });

      if (payment) {
        await supabaseAdmin
          .from("payments")
          .update({
            provider_payment_id: result.providerPaymentId,
            raw_payload: result.raw as never,
          })
          .eq("id", payment.id);
      }

      return {
        ok: true,
        orderNumber: order.order_number,
        accessToken: order.access_token,
        redirectUrl: result.paymentUrl,
      };
    } catch (error) {
      if (payment) {
        await supabaseAdmin
          .from("payments")
          .update({
            status: "failed",
            error_message: error instanceof Error ? error.message : "Unknown error",
          })
          .eq("id", payment.id);
      }
      return { ok: false, error: "The card payment could not be started. Please try again." };
    }
  });

export type PublicOrder = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  email: string;
  fullName: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  items: { name: string; quantity: number; unitPriceCents: number; lineTotalCents: number }[];
};

export const getOrderForConfirmation = createServerFn({ method: "GET" })
  .inputValidator((data: { orderNumber: string; token: string }) =>
    z.object({ orderNumber: z.string().min(1).max(64), token: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }): Promise<PublicOrder | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_number, status, payment_status, email, full_name, subtotal_cents, shipping_cents, total_cents",
      )
      .eq("order_number", data.orderNumber)
      .eq("access_token", data.token)
      .maybeSingle();

    if (!order) return null;

    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("product_name, quantity, unit_price_cents, line_total_cents")
      .eq("order_id", order.id);

    return {
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      email: order.email,
      fullName: order.full_name,
      subtotalCents: order.subtotal_cents,
      shippingCents: order.shipping_cents,
      totalCents: order.total_cents,
      items: (items ?? []).map((item) => ({
        name: item.product_name,
        quantity: item.quantity,
        unitPriceCents: item.unit_price_cents,
        lineTotalCents: item.line_total_cents,
      })),
    };
  });
