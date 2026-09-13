import { createFileRoute, Link } from "@tanstack/react-router";
import { SOCIAL_IMAGE } from "@/lib/site";

const title = "Window display arrangements — Creionescu";
const description =
  "Custom window display arrangements and seasonal decor projects for shops, events and businesses, handcrafted by Creionescu.";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/blog" },
      { property: "og:image", content: SOCIAL_IMAGE },
      { name: "twitter:image", content: SOCIAL_IMAGE },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

const gallery = [
  {
    src: "/images/WhatsApp-Image-2025-07-18-at-19.22.59_e47e8c1d-p-800.jpg",
    srcSet:
      "/images/WhatsApp-Image-2025-07-18-at-19.22.59_e47e8c1d-p-500.jpg 500w, /images/WhatsApp-Image-2025-07-18-at-19.22.59_e47e8c1d-p-800.jpg 800w",
    alt: "Window display arrangement with handcrafted props",
  },
  {
    src: "/images/WhatsApp-Image-2025-07-18-at-20.20.28_4ba6a545-p-1080.jpg",
    srcSet:
      "/images/WhatsApp-Image-2025-07-18-at-20.20.28_4ba6a545-p-500.jpg 500w, /images/WhatsApp-Image-2025-07-18-at-20.20.28_4ba6a545-p-800.jpg 800w, /images/WhatsApp-Image-2025-07-18-at-20.20.28_4ba6a545-p-1080.jpg 1080w",
    alt: "Seasonal shop window decoration",
  },
  {
    src: "/images/WhatsApp-Image-2025-07-18-at-20.20.32_900d0569-p-1080.jpg",
    srcSet:
      "/images/WhatsApp-Image-2025-07-18-at-20.20.32_900d0569-p-500.jpg 500w, /images/WhatsApp-Image-2025-07-18-at-20.20.32_900d0569-p-800.jpg 800w, /images/WhatsApp-Image-2025-07-18-at-20.20.32_900d0569-p-1080.jpg 1080w",
    alt: "Storefront styling with polystyrene props",
  },
  {
    src: "/images/WhatsApp-Image-2025-07-18-at-20.20.41_14f38d2b-p-800.jpg",
    srcSet:
      "/images/WhatsApp-Image-2025-07-18-at-20.20.41_14f38d2b-p-500.jpg 500w, /images/WhatsApp-Image-2025-07-18-at-20.20.41_14f38d2b-p-800.jpg 800w",
    alt: "Event decoration arrangement",
  },
];

function BlogPage() {
  return (
    <section className="section section-hero">
      <div className="spacer-mid" />
      <div className="w-layout-blockcontainer container w-container">
        <div className="w-layout-grid _2-column-heading-grid">
          <h1 className="heading-h2">Window display arrangements</h1>
          <div className="news-paragraph-container">
            <p className="paragraph-20">
              A look at custom window displays and themed decor arrangements we build for shops,
              events and businesses. Every arrangement is handcrafted around your space, your
              season and your theme.
            </p>
          </div>
        </div>
        <div className="news-grid">
          {gallery.map((item) => (
            <div className="news-item" key={item.src}>
              <div className="news-card">
                <div className="news-image-container">
                  <img
                    src={item.src}
                    srcSet={item.srcSet}
                    sizes="(max-width: 767px) 100vw, 33vw"
                    loading="lazy"
                    alt={item.alt}
                    className="news-image"
                  />
                </div>
                <div className="news-text-container">
                  <div className="card-title">{item.alt}</div>
                  <Link to="/contact" className="blog-button w-inline-block">
                    <div>Request a similar display</div>
                    <div className="news-link-image-wrapper">
                      <img src="/images/arrow_outward.svg" loading="lazy" alt="" className="news-link-image" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
