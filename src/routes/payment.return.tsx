import { createFileRoute, Navigate } from "@tanstack/react-router";
import { z } from "zod";

// NETOPIA sends the customer back here after the card flow. The browser never
// decides the payment status — the confirmation page reads it from the database,
// which is only updated by the server-to-server notification endpoint.
export const Route = createFileRoute("/payment/return")({
  validateSearch: z.object({
    order: z.string().catch(""),
    token: z.string().catch(""),
  }),
  head: () => ({
    meta: [{ title: "Processing payment — Creionescu" }, { name: "robots", content: "noindex" }],
  }),
  component: PaymentReturn,
});

function PaymentReturn() {
  const { order, token } = Route.useSearch();

  if (!order || !token) {
    return (
      <section className="section section-produtcs-hero">
        <div className="w-layout-blockcontainer container w-container">
          <h1 className="heading-h2">We couldn't identify your order</h1>
          <p className="paragraph-20">Please check the confirmation email for your order link.</p>
        </div>
      </section>
    );
  }

  return (
    <Navigate to="/order/$orderNumber" params={{ orderNumber: order }} search={{ token }} replace />
  );
}
