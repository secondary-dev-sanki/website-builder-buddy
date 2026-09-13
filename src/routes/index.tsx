import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCatalog } from "@/lib/catalog.functions";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { SOCIAL_IMAGE } from "@/lib/site";

const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => getCatalog(),
});

const title = "Creionescu — Custom polystyrene decorations & interior styling";
const description =
  "Handcrafted polystyrene figurines, life-sized props and window display arrangements, made to order in Romania. Shop decorations or ask about interior styling.";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { property: "og:image", content: SOCIAL_IMAGE },
      { name: "twitter:image", content: SOCIAL_IMAGE },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(catalogQuery);
  const figurines = data.categories.find((category) => category.slug === "figurines");
  const props = data.categories.find((category) => category.slug === "props");

  return (
    <>
      <section className="homepage-hero-section">
        <div className="container">
          <div className="hero-wrapper">
            <div className="hero-text-wrapper">
              <h1 className="display-heading-1">
                CREIOONESCU <strong>™</strong>
              </h1>
              <div className="max-width-50rem">
                <p className="paragraph-20">
                  <em>
                    Custom decorations and interior design services. Creative solutions and unique
                    designs to transform any space.
                  </em>
                </p>
              </div>
              <div className="hero-buttons-container">
                <Link to="/products" className="primary-button w-button">
                  shop decorations
                </Link>
                <Link to="/services" className="secondary-button w-button">
                  design gallery
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <img
                src="/images/jorge-zapata-coZ2i9LblM8-unsplash.jpg"
                loading="eager"
                sizes="100vw"
                alt="Creionescu handcrafted decorations"
                srcSet="/images/jorge-zapata-coZ2i9LblM8-unsplash-p-500.jpg 500w, /images/jorge-zapata-coZ2i9LblM8-unsplash-p-800.jpg 800w, /images/jorge-zapata-coZ2i9LblM8-unsplash-p-1080.jpg 1080w"
                className="hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      {[figurines, props].map((category) =>
        category ? (
          <section className="section section-black" key={category.slug}>
            <div className="container">
              <div className="max-60rem-title-wrapper">
                <p className="hero-label hero-label-white">Best Sellers</p>
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
                    {category.slug === "figurines" ? "View All Figurines" : "View All decorations"}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : null,
      )}

      <section className="section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="heading-max-width-wrapper">
            <h1 className="display-heading-1">Our Services</h1>
          </div>
          <div className="w-layout-grid services-grid-homepage">
            <div className="services-card">
              <h3 className="heading-h3">Custom Polystyrene Decorations</h3>
              <div className="paragraph-18">
                Unique, handcrafted foam decor made to order for events and creative spaces.
              </div>
              <Link to="/products" className="secondary-button pin-to-bottom w-button">
                view gallery
              </Link>
            </div>
            <div className="services-card center-card">
              <h3 className="heading-h3">Interior Styling Services</h3>
              <div className="paragraph-18">
                Creative solutions to transform interiors into inspiring, stylish spaces
              </div>
              <Link to="/services" className="secondary-button pin-to-bottom w-button">
                view gallery
              </Link>
            </div>
            <div className="services-card">
              <h3 className="heading-h3">Window Display Arrangements</h3>
              <div className="paragraph-18">
                Eye-catching, tailored designs for commercial storefronts and visual merchandising.
              </div>
              <Link to="/blog" className="secondary-button w-button">
                View gallery
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-black">
        <div className="w-layout-blockcontainer container w-container">
          <div className="collage-title-wrapper">
            <div className="max-width-40rem">
              <p className="paragraph-32 white-text">
                At Creioonescu, we handcraft polystyrene figurines, custom-made and full of
                character, perfect for creative decor.
              </p>
            </div>
            <Link to="/products" className="primary-button button-white w-button">
              Shop Now
            </Link>
          </div>
          <div className="collage-wrapper">
            <div className="collage-center-image-wrapper">
              <img
                src="/images/WhatsApp-Image-2025-07-18-at-18.34.52_c7ca4167.jpg"
                loading="lazy"
                sizes="(max-width: 767px) 100vw, 940px"
                srcSet="/images/WhatsApp-Image-2025-07-18-at-18.34.52_c7ca4167-p-500.jpg 500w, /images/WhatsApp-Image-2025-07-18-at-18.34.52_c7ca4167-p-800.jpg 800w, /images/WhatsApp-Image-2025-07-18-at-18.34.52_c7ca4167-p-1080.jpg 1080w"
                alt="Handcrafted polystyrene decorations"
                className="collage-center-image"
              />
            </div>
            <div className="collage-small-image-wrapper image-1">
              <img
                src="/images/WhatsApp-Image-2025-07-18-at-18.42.37_11a97211-p-800.jpg"
                loading="lazy"
                sizes="(max-width: 767px) 100vw, 940px"
                srcSet="/images/WhatsApp-Image-2025-07-18-at-18.42.37_11a97211-p-500.jpg 500w, /images/WhatsApp-Image-2025-07-18-at-18.42.37_11a97211-p-800.jpg 800w"
                alt="Decorative props detail"
                className="collage-small-image"
              />
            </div>
            <div className="collage-small-image-wrapper image-2">
              <img
                src="/images/WhatsApp-Image-2025-07-18-at-18.34.51_18171659.jpg"
                loading="lazy"
                sizes="(max-width: 767px) 100vw, 940px"
                srcSet="/images/WhatsApp-Image-2025-07-18-at-18.34.51_18171659-p-500.jpg 500w, /images/WhatsApp-Image-2025-07-18-at-18.34.51_18171659-p-800.jpg 800w"
                alt="Candy props display"
                className="collage-small-image"
              />
            </div>
            <div className="collage-small-image-wrapper image-3">
              <img
                src="/images/WhatsApp-Image-2025-07-18-at-18.35.00_0b80b96e.jpg"
                loading="lazy"
                sizes="(max-width: 767px) 100vw, 940px"
                srcSet="/images/WhatsApp-Image-2025-07-18-at-18.35.00_0b80b96e-p-500.jpg 500w, /images/WhatsApp-Image-2025-07-18-at-18.35.00_0b80b96e-p-800.jpg 800w, /images/WhatsApp-Image-2025-07-18-at-18.35.00_0b80b96e-p-1080.jpg 1080w"
                alt="Life-sized pumpkin props"
                className="collage-small-image"
              />
            </div>
            <div className="collage-small-image-wrapper image-4">
              <img
                src="/images/WhatsApp-Image-2025-07-18-at-19.22.59_e47e8c1d-p-800.jpg"
                loading="lazy"
                sizes="(max-width: 767px) 100vw, 940px"
                srcSet="/images/WhatsApp-Image-2025-07-18-at-19.22.59_e47e8c1d-p-500.jpg 500w, /images/WhatsApp-Image-2025-07-18-at-19.22.59_e47e8c1d-p-800.jpg 800w"
                alt="Window display arrangement"
                className="collage-small-image"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section section-black">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-grid stardard-grid">
            <div className="_2-column-grid-image-container">
              <img
                src="/images/khara-woods-KR84RpMCb0w-unsplash-p-1080.jpg"
                loading="lazy"
                sizes="(max-width: 767px) 100vw, 940px"
                srcSet="/images/khara-woods-KR84RpMCb0w-unsplash-p-500.jpg 500w, /images/khara-woods-KR84RpMCb0w-unsplash-p-800.jpg 800w, /images/khara-woods-KR84RpMCb0w-unsplash-p-1080.jpg 1080w"
                alt="Styled interior detail"
                className="grid-image"
              />
            </div>
            <div className="_2-column-text-container">
              <div className="_2-colums-text-max-width">
                <h2 className="heading-h3 heading-h3-white">
                  Creative Solutions for Decor and Styling
                </h2>
                <Reveal className="text-points-container">
                  <h3 className="heading-h5 white-text">
                    <strong>Custom Foam Figurines</strong>
                  </h3>
                  <div className="paragraph-20 paragraph-20-white">
                    Custom decorative elements for spaces and events.
                  </div>
                </Reveal>
                <Reveal className="text-points-container" delay={100}>
                  <h3 className="heading-h5 white-text">
                    <strong>Props and Custom Works</strong>
                  </h3>
                  <div className="paragraph-20 paragraph-20-white">
                    Made-to-order pieces built around your theme and your space.
                  </div>
                </Reveal>
                <Reveal className="text-points-container" delay={200}>
                  <h3 className="heading-h5 white-text">
                    <strong>Window Display Arrangements</strong>
                  </h3>
                  <div className="paragraph-20 paragraph-20-white">
                    Attractive, creative designs for commercial storefronts.
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
