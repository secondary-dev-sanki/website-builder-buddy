import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getProductBySlug } from "@/lib/catalog.functions";
import { ProductCard } from "@/components/ProductCard";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/lib/cart";
import { SITE_URL } from "@/lib/site";

const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!result) throw notFound();
    return {
      name: result.product.name,
      description: result.product.shortDescription ?? result.product.description,
      image: result.product.images[0]?.url ?? null,
    };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product not found — Creionescu" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.name} — Creionescu`;
    const description =
      loaderData.description ?? "Handcrafted polystyrene decoration made to order by Creionescu.";
    const image = loaderData.image ? `${SITE_URL}${loaderData.image}` : null;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/product/${params.slug}` },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: `/product/${params.slug}` }],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!data) return null;
  const { product, related } = data;
  const image = product.images[0];

  const add = () => {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        priceCents: product.priceCents,
        imageUrl: image?.url ?? null,
      },
      quantity,
    );
  };

  return (
    <>
      <section className="section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-grid shop-product-grid">
            <div className="shop-product-gallery">
              {product.images.map((productImage) => (
                <div className="shop-product-image-wrapper" key={productImage.url}>
                  <img
                    src={productImage.url}
                    {...(productImage.srcset ? { srcSet: productImage.srcset } : {})}
                    sizes="(max-width: 767px) 100vw, (max-width: 991px) 95vw, 890px"
                    loading="lazy"
                    alt={productImage.alt ?? product.name}
                  />
                </div>
              ))}
            </div>
            <div className="shop-product-details">
              <div className="shop-product-heading-wrapper">
                <h1 className="heading-h3 heading-h3-product">{product.name}</h1>
                <div className="heading-h4 h4-product">{formatMoney(product.priceCents)}</div>
              </div>
              <p>{product.description ?? product.shortDescription}</p>
              <div className="add-to-cart">
                {product.inStock && product.stock > 0 ? (
                  <form
                    className="w-commerce-commerceaddtocartform"
                    onSubmit={(event) => {
                      event.preventDefault();
                      add();
                      setAdded(true);
                    }}
                  >
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={99}
                      className="w-commerce-commerceaddtocartquantityinput form-input"
                      value={quantity}
                      onChange={(event) =>
                        setQuantity(Math.max(1, Math.min(99, Number(event.target.value) || 1)))
                      }
                      aria-label="Quantity"
                    />
                    <div className="product-page-buttom-wrapper">
                      <input
                        type="submit"
                        className="w-commerce-commerceaddtocartbutton primary-button"
                        value={added ? "Added to cart" : "Add to Cart"}
                      />
                      <button
                        type="button"
                        className="w-commerce-commercebuynowbutton secondary-button"
                        onClick={() => {
                          add();
                          navigate({ to: "/checkout" });
                        }}
                      >
                        Buy now
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="w-commerce-commerceaddtocartoutofstock">
                    <div>This product is out of stock.</div>
                  </div>
                )}
              </div>
              <div className="shop-product-add-to-cart">
                <div className="text-size-tiny">Flat-rate delivery in Romania</div>
              </div>
              <div className="shop-product-accordion-wrapper">
                <Accordion title="Details">
                  <p className="paragraph-16 margin-bottom-16">
                    {product.description ?? product.shortDescription}
                  </p>
                </Accordion>
                <Accordion title="Shipping">
                  <p className="paragraph-16 margin-bottom-16">
                    Orders are handcrafted and processed within 1-3 business days, then delivered
                    anywhere in Romania for a flat delivery fee shown at checkout.
                  </p>
                </Accordion>
                <Accordion title="Returns">
                  <p className="paragraph-16 margin-bottom-16">
                    Because every piece is made to order, please contact us before returning an
                    item so we can find the best solution for you.
                  </p>
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="section section-black">
          <div className="container">
            <div className="max-60rem-title-wrapper">
              <h2 className="display-heading-1 display-heading-1-white">Related products</h2>
            </div>
            <div className="udesly-section">
              <div className="w-layout-grid udesly-cards-grid">
                {related.map((item, index) => (
                  <ProductCard key={item.id} product={item} delay={index * 100} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="shop-product-accordion">
      <div
        className="shop-product-heading"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") setOpen((value) => !value);
        }}
      >
        <div className="paragraph-18 text-weight-semibold">{title}</div>
        <div className="shop-product-accordion-icon">{open ? "–" : "+"}</div>
      </div>
      {open ? <div className="shop-product-accordion-details">{children}</div> : null}
    </div>
  );
}
