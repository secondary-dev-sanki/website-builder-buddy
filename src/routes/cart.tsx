import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { SHIPPING_FLAT_CENTS } from "@/lib/site";

const title = "Your cart — Creionescu";
const description = "Review the decorations in your cart and continue to guest checkout.";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/cart" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, hydrated, setQuantity, removeItem, subtotalCents } = useCart();

  return (
    <section className="section section-produtcs-hero">
      <div className="w-layout-blockcontainer container w-container">
        <h1 className="heading-h2 margin-bottom-32">Your cart</h1>

        {!hydrated ? null : items.length === 0 ? (
          <div>
            <p className="paragraph-20">Your cart is empty.</p>
            <Link to="/products" className="primary-button w-button">
              Shop decorations
            </Link>
          </div>
        ) : (
          <>
            {items.map((line) => (
              <div className="w-commerce-commercecartitem" key={line.productId}>
                {line.imageUrl ? (
                  <img
                    src={line.imageUrl}
                    alt={line.name}
                    className="w-commerce-commercecartitemimage"
                  />
                ) : null}
                <div className="w-commerce-commercecartiteminfo">
                  <Link to="/product/$slug" params={{ slug: line.slug }} className="paragraph-18">
                    {line.name}
                  </Link>
                  <div className="paragraph-16">{formatMoney(line.priceCents)}</div>
                  <button
                    type="button"
                    className="w-commerce-commercecartoptionlist"
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => removeItem(line.productId)}
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="number"
                  min={1}
                  max={99}
                  className="w-commerce-commercecartquantity form-input"
                  value={line.quantity}
                  aria-label={`Quantity for ${line.name}`}
                  onChange={(event) =>
                    setQuantity(line.productId, Number(event.target.value) || 1)
                  }
                />
                <div className="paragraph-18">
                  {formatMoney(line.priceCents * line.quantity)}
                </div>
              </div>
            ))}

            <div className="w-commerce-commercecartfooter">
              <div className="w-commerce-commercecartlineitem">
                <div>Subtotal</div>
                <div>{formatMoney(subtotalCents)}</div>
              </div>
              <div className="w-commerce-commercecartlineitem">
                <div>Delivery</div>
                <div>{formatMoney(SHIPPING_FLAT_CENTS)}</div>
              </div>
              <div className="w-commerce-commercecartlineitem">
                <div className="paragraph-18 text-weight-semibold">Total</div>
                <div className="paragraph-18 text-weight-semibold">
                  {formatMoney(subtotalCents + SHIPPING_FLAT_CENTS)}
                </div>
              </div>
              <div className="hero-buttons-container">
                <Link to="/checkout" className="primary-button w-button">
                  Checkout
                </Link>
                <Link to="/products" className="secondary-button w-button">
                  Continue shopping
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
