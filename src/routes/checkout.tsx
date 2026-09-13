import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { SHIPPING_FLAT_CENTS } from "@/lib/site";
import { createOrderAndStartPayment } from "@/lib/checkout.functions";

const title = "Checkout — Creionescu";
const description = "Guest checkout for Creionescu decorations, with card payment and delivery in Romania.";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/checkout" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { lines, subtotalCents, hydrated } = useCart();
  const submitOrder = useServerFn(createOrderAndStartPayment);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCents = subtotalCents + SHIPPING_FLAT_CENTS;

  if (hydrated && lines.length === 0) {
    return (
      <section className="section section-produtcs-hero">
        <div className="w-layout-blockcontainer container w-container">
          <h1 className="heading-h2 margin-bottom-32">Checkout</h1>
          <p className="paragraph-20">Your cart is empty.</p>
          <Link to="/products" className="primary-button w-button">
            Shop decorations
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section section-produtcs-hero">
      <div className="w-layout-blockcontainer container w-container">
        <h1 className="heading-h2 margin-bottom-32">Checkout</h1>
        <div className="contact-form-block w-form">
          <form
            className="contact-form-grid"
            onSubmit={async (event) => {
              event.preventDefault();
              if (submitting) return;
              setSubmitting(true);
              setError(null);
              const form = new FormData(event.currentTarget);
              const value = (key: string) => String(form.get(key) ?? "").trim();
              try {
                const result = await submitOrder({
                  data: {
                    email: value("email"),
                    fullName: value("fullName"),
                    phone: value("phone"),
                    addressLine1: value("addressLine1"),
                    addressLine2: value("addressLine2"),
                    city: value("city"),
                    county: value("county"),
                    postalCode: value("postalCode"),
                    notes: value("notes"),
                    items: lines.map((line) => ({
                      productId: line.productId,
                      quantity: line.quantity,
                    })),
                  },
                });
                if (!result.ok) {
                  setError(result.error);
                  setSubmitting(false);
                  return;
                }
                if (result.redirectUrl) {
                  window.location.href = result.redirectUrl;
                  return;
                }
                navigate({
                  to: "/order/$orderNumber",
                  params: { orderNumber: result.orderNumber },
                  search: { token: result.accessToken },
                });
              } catch {
                setError("Something went wrong placing the order. Please try again.");
                setSubmitting(false);
              }
            }}
          >
            <div className="contact-side-container">
              <h2 className="heading-h5 margin-bottom-16">Order summary</h2>
              {lines.map((line) => (
                <div className="w-commerce-commercecartlineitem" key={line.productId}>
                  <div className="paragraph-16">
                    {line.name} × {line.quantity}
                  </div>
                  <div className="paragraph-16">{formatMoney(line.priceCents * line.quantity)}</div>
                </div>
              ))}
              <div className="w-commerce-commercecartlineitem">
                <div>Subtotal</div>
                <div>{formatMoney(subtotalCents)}</div>
              </div>
              <div className="w-commerce-commercecartlineitem">
                <div>Delivery (Romania)</div>
                <div>{formatMoney(SHIPPING_FLAT_CENTS)}</div>
              </div>
              <div className="w-commerce-commercecartlineitem">
                <div className="paragraph-18 text-weight-semibold">Total</div>
                <div className="paragraph-18 text-weight-semibold">{formatMoney(totalCents)}</div>
              </div>
              <p className="paragraph-16">
                The final total is recalculated on our server from the current product prices.
              </p>
            </div>

            <div className="form-elements-grid">
              <Field name="email" label="Email address *" type="email" placeholder="you@example.com" required />
              <Field name="fullName" label="Full name *" placeholder="Name and surname" required />
              <Field name="phone" label="Phone *" placeholder="07xx xxx xxx" required />
              <Field name="addressLine1" label="Address *" placeholder="Street, number" required />
              <Field name="addressLine2" label="Address details" placeholder="Block, apartment" />
              <Field name="city" label="City *" placeholder="City" required />
              <Field name="county" label="County *" placeholder="County" required />
              <Field name="postalCode" label="Postal code *" placeholder="000000" required />
              <div className="_100-width">
                <label htmlFor="country" className="field-label">
                  Country
                </label>
                <input
                  className="text-field w-input"
                  id="country"
                  name="country"
                  value="Romania"
                  readOnly
                />
              </div>
              <div className="_100-width">
                <label htmlFor="notes" className="field-label">
                  Order notes
                </label>
                <textarea
                  className="text-field text-field-area w-input"
                  id="notes"
                  name="notes"
                  maxLength={1000}
                  placeholder="Anything we should know about your order"
                />
              </div>
              {error ? (
                <div className="_100-width">
                  <div className="error-message">
                    <div className="paragraph-16">{error}</div>
                  </div>
                </div>
              ) : null}
              <div className="_100-width">
                <input
                  type="submit"
                  className="primary-button w-button"
                  value={submitting ? "Please wait..." : "Place order and pay by card"}
                  disabled={submitting}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="_100-width">
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      <input
        className="text-field w-input"
        id={name}
        name={name}
        type={type}
        maxLength={256}
        {...(placeholder ? { placeholder } : {})}
        required={required}
      />
    </div>
  );
}
