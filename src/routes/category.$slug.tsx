import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCatalog } from "@/lib/catalog.functions";
import { ProductCard } from "@/components/ProductCard";
import { SOCIAL_IMAGE } from "@/lib/site";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ context, params }) => {
    const catalog = await context.queryClient.ensureQueryData(catalogQuery);
    const category = catalog.categories.find((item) => item.slug === params.slug);
    if (!category) throw notFound();
    return { name: category.name, description: category.description };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found — Creionescu" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.name} — Creionescu`;
    const description =
      loaderData.description ?? "Handcrafted polystyrene decorations by Creionescu.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/category/${params.slug}` },
        { property: "og:image", content: SOCIAL_IMAGE },
        { name: "twitter:image", content: SOCIAL_IMAGE },
      ],
      links: [{ rel: "canonical", href: `/category/${params.slug}` }],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(catalogQuery);
  const category = data.categories.find((item) => item.slug === slug);

  if (!category) return null;

  return (
    <>
      <section className="section section-produtcs-hero">
        <div className="w-layout-blockcontainer container w-container">
          <div className="heading-max-width-wrapper">
            <h1 className="display-heading-1 margin-bottom-24">{category.name}</h1>
            <p className="paragraph-20">{category.description}</p>
          </div>
        </div>
      </section>
      <section className="section section-black">
        <div className="container">
          <div className="udesly-section">
            <div className="w-layout-grid udesly-cards-grid">
              {category.products.map((product, index) => (
                <ProductCard key={product.id} product={product} delay={index * 100} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
