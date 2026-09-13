import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { getOrderForConfirmation } from "@/lib/checkout.functions";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/order/$orderNumber")({
  validateSearch: z.object({ token: z.string().catch("") }),
  head: () => ({
    meta: [
      { title: "Order confirmation — Creionescu" },
      { name: "description", content: "Your Creionescu order summary and payment status." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { orderNumber } = Route.useParams();
  const { token } = Route.useSearch();
  const fetchOrder = useServerFn(getOrderForConfirmation);
  const { clear } = useCart();
  const cleared = useRef(false);

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderNumber, token],
    queryFn: () => fetchOrder({ data: { orderNumber, token } }),
    enabled: token.length > 0,
    refetchInterval: (query) =>
      query.state.data && query.state.data.paymentStatus === "pending" ? 4000 : false,
  });

  useEffect(() => {
    if (data && !cleared.current) {
      cleared.current = true;
      clear();
    }
  }, [data, clear]);

  return (
    <section className="section section-produtcs-hero">
      <div className="w-layout-blockcontainer container w-container">
        {isLoading ? (
          <p className="paragraph-20">Loading your order…</p>
        ) : !data ? (
          <>
            <h1 className="heading-h2 margin-bottom-32">Order not found</h1>
            <p className="paragraph-20">
              We couldn't find this order. Please use the confirmation link we sent you.
            </p>
            <Link to="/" className="primary-button w-button">
              Go home
            </Link>
          </>
        ) : (
          <>
            <h1 className="heading-h2 margin-bottom-32">Thank you, {data.fullName}!</h1>
            <p className="paragraph-20">
              Order <strong>{data.orderNumber}</strong> —{" "}
              {data.paymentStatus === "paid"
                ? "payment confirmed."
                : data.paymentStatus === "failed"
                  ? "the payment did not go through. Please contact us and we'll help you complete it."
                  : data.paymentStatus === "cancelled"
                    ? "the payment was cancelled."
                    : "we're waiting for the payment confirmation. This page updates automatically."}
            </p>
            <div className="spacer-medium" />
            {data.items.map((item) => (
              <div className="w-commerce-commercecartlineitem" key={item.name}>
                <div className="paragraph-16">
                  {item.name} × {item.quantity}
                </div>
                <div className="paragraph-16">{formatMoney(item.lineTotalCents)}</div>
              </div>
            ))}
            <div className="w-commerce-commercecartlineitem">
              <div>Subtotal</div>
              <div>{formatMoney(data.subtotalCents)}</div>
            </div>
            <div className="w-commerce-commercecartlineitem">
              <div>Delivery</div>
              <div>{formatMoney(data.shippingCents)}</div>
            </div>
            <div className="w-commerce-commercecartlineitem">
              <div className="paragraph-18 text-weight-semibold">Total</div>
              <div className="paragraph-18 text-weight-semibold">
                {formatMoney(data.totalCents)}
              </div>
            </div>
            <div className="spacer-medium" />
            <p className="paragraph-16">A copy of this summary is linked to {data.email}.</p>
            <Link to="/products" className="primary-button w-button">
              Continue shopping
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
