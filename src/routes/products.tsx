import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCatalog } from "@/lib/catalog.functions";
import { ProductCard } from "@/components/ProductCard";
import { SOCIAL_IMAGE } from "@/lib/site";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

const title = "Our products — Creionescu decorations";
const description =
  "Browse handcrafted polystyrene figurines and life-sized decorative props from Creionescu. Order online with delivery in Romania.";

export const Route = createFileRoute("/products")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/products" },
      { property: "og:image", content: SOCIAL_IMAGE },
      { name: "twitter:image", content: SOCIAL_IMAGE },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { data } = useSuspenseQuery(catalogQuery);

  return (
    <>
      <section className="section section-produtcs-hero">
        <div className="w-layout-blockcontainer container w-container">
          <div className="heading-max-width-wrapper">
            <h1 className="display-heading-1 margin-bottom-24">oUR pRODUCTS</h1>
            <p className="paragraph-20">
              Discover our wide range of creative decorations designed to bring style and
              personality to any space. From handcrafted figurines and custom props to unique
              decorative pieces, explore everything you need to create eye-catching displays and
              elevate your interior design.
            </p>
          </div>
        </div>
      </section>

      {data.categories.map((category) => (
        <section className="section section-black" key={category.id}>
          <div className="container">
            <div className="max-60rem-title-wrapper">
              <h1 className="display-heading-1 display-heading-1-white">
                {category.slug === "figurines" ? "figurines" : "props"}
              </h1>
            </div>
            <div className="udesly-section">
              <div className="w-layout-grid udesly-cards-grid">
                {category.products.map((product, index) => (
                  <ProductCard key={product.id} product={product} delay={index * 100} />
                ))}
              </div>
              <div className="products-button-wrapper">
                <Link
                  to="/category/$slug"
                  params={{ slug: category.slug }}
                  className="primary-button button-white w-button"
                >
                  {category.slug === "figurines" ? "View All Figurines" : "View All Props"}
                </Link>
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
