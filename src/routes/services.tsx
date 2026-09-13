import { createFileRoute, Link } from "@tanstack/react-router";
import { SOCIAL_IMAGE } from "@/lib/site";

const title = "Interior design services — Creionescu";
const description =
  "Creative, functional interior design: space planning, colour and material selection, styling, and custom hand-painted wall murals.";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/services" },
      { property: "og:image", content: SOCIAL_IMAGE },
      { name: "twitter:image", content: SOCIAL_IMAGE },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

export default function noop() {}

function ServicesPage() {
  return (
    <>
      <section className="services-hero-section">
        <div className="container container-hero-5">
          <div className="hero-5-text-container">
            <div className="hero-5-text-inner-container">
              <h1 className="display-heading-1 display-heading-1-white">
                interior design Services
              </h1>
              <div className="hero-5-paragraph-container">
                <p className="paragraph-20 paragraph-20-white">
                  We design creative, functional spaces with attention to detail and quality
                  craftsmanship. From cozy cafes to modern offices, our interior design services
                  bring character and style to every project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="Services" className="section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="heading-max-width-wrapper">
            <h2 className="heading-h1">Our Core Services</h2>
          </div>
          <div className="standard-line" />
          <div className="spacer-mid" />
          <div className="benefits-1-2-columns-grid">
            <div className="benefits-card">
              <div className="benefit-card-container">
                <div className="benefit-card-text-container">
                  <h3 className="benefits-card-heading">Examples</h3>
                </div>
                <img
                  src="/images/WhatsApp-Image-2025-07-21-at-18.13.10_52ecd501.jpg"
                  loading="lazy"
                  sizes="(max-width: 767px) 100vw, (max-width: 991px) 95vw, 940px"
                  srcSet="/images/WhatsApp-Image-2025-07-21-at-18.13.10_52ecd501-p-500.jpg 500w, /images/WhatsApp-Image-2025-07-21-at-18.13.10_52ecd501-p-800.jpg 800w, /images/WhatsApp-Image-2025-07-21-at-18.13.10_52ecd501-p-1080.jpg 1080w"
                  alt="Styled interior project by Creionescu"
                  className="benifit-card-image-big"
                />
                <img
                  src="/images/WhatsApp-Image-2025-07-20-at-19.38.33_9e4df147.jpg"
                  loading="lazy"
                  sizes="(max-width: 767px) 100vw, (max-width: 991px) 95vw, 940px"
                  srcSet="/images/WhatsApp-Image-2025-07-20-at-19.38.33_9e4df147-p-500.jpg 500w, /images/WhatsApp-Image-2025-07-20-at-19.38.33_9e4df147-p-800.jpg 800w, /images/WhatsApp-Image-2025-07-20-at-19.38.33_9e4df147-p-1080.jpg 1080w, /images/WhatsApp-Image-2025-07-20-at-19.38.33_9e4df147-p-1600.jpg 1600w"
                  alt="Interior styling detail"
                  className="benifit-card-image-big"
                />
              </div>
            </div>
            <div className="benefits-card benfits-card-black">
              <h3 className="benefits-card-heading">Interior Design Solutions</h3>
              <p className="paragraph-20 paragraph-20-white">
                We offer creative, functional design services to elevate any space:
              </p>
              <ul role="list" className="list">
                <li className="list-item">
                  <div className="paragraph-18 paragraph-18-white">
                    <strong>Space Planning &amp; Layouts:</strong> Smart, efficient arrangements for
                    homes, offices, restaurants, and more.
                  </div>
                </li>
                <li>
                  <div className="paragraph-18 paragraph-18-white">
                    <strong>Color &amp; Material Selection: </strong>Expert guidance to choose the
                    right palettes and textures for a cohesive look.
                  </div>
                </li>
                <li>
                  <div className="paragraph-18 paragraph-18-white">
                    <strong>Styling &amp; Decor Coordination: </strong>Professional styling to
                    ensure every detail complements your vision.
                  </div>
                </li>
              </ul>
            </div>
            <div className="benefits-card">
              <h3 className="benefits-card-heading">Details &amp; Customization</h3>
              <p className="paragraph-20">Bringing personality and atmosphere into your interiors:</p>
              <ul role="list" className="list">
                <li className="list-item">
                  <div className="paragraph-18">
                    <strong>Wall Murals &amp; Artistic Features: </strong>Unique hand-painted murals
                    and accents tailored to your space.
                  </div>
                </li>
                <li>
                  <div className="paragraph-18">
                    <strong>Furniture &amp; Decor Selection:</strong> Guidance on choosing
                    furnishings and decorative elements that match your style.
                  </div>
                </li>
                <li>
                  <div className="paragraph-18">
                    <strong>Decorative Finishes: </strong>Final touches that enhance the overall
                    style and harmony of your interior.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-black-background">
        <div className="w-layout-blockcontainer container w-container">
          <div className="benefits-3-columns-grid">
            <div className="benefits-text-container">
              <div>
                <h2 className="heading-h2-medium heading-h2-medium-white">All Services</h2>
              </div>
              <p className="paragraph-20 paragraph-20-white">
                The service we offer is specifically designed to meet your needs.
              </p>
              <Link to="/contact" className="primary-button button-white w-button">
                Contact Us
              </Link>
            </div>
            <div className="benefits-card benfits-card-black">
              <h3 className="benefits-card-heading">Before</h3>
              <img
                src="/images/480972179_2939030536251520_592891427674590918_n.jpg"
                loading="lazy"
                sizes="(max-width: 767px) 100vw, (max-width: 991px) 95vw, 940px"
                srcSet="/images/480972179_2939030536251520_592891427674590918_n-p-500.jpg 500w, /images/480972179_2939030536251520_592891427674590918_n-p-800.jpg 800w, /images/480972179_2939030536251520_592891427674590918_n-p-1080.jpg 1080w"
                alt="Room before styling"
                className="benifit-card-image-big"
              />
            </div>
            <div className="benefits-card benfits-card-black">
              <h3 className="benefits-card-heading">After</h3>
              <img
                src="/images/480568076_2939030699584837_4331951045568136511_n-p-1080.jpg"
                loading="lazy"
                sizes="(max-width: 767px) 100vw, (max-width: 991px) 95vw, 940px"
                srcSet="/images/480568076_2939030699584837_4331951045568136511_n-p-500.jpg 500w, /images/480568076_2939030699584837_4331951045568136511_n-p-800.jpg 800w, /images/480568076_2939030699584837_4331951045568136511_n-p-1080.jpg 1080w"
                alt="Room after styling"
                className="benifit-card-image-big"
              />
            </div>
            <div className="benefits-card benfits-card-black">
              <h3 className="benefits-card-heading">
                🎨 <strong>Custom Wall Murals</strong>
              </h3>
              <p className="paragraph-18 paragraph-18-white margin-bottom-16">
                Transform plain walls into stunning works of art with our custom hand-painted
                murals. Perfect for kindergartens, cafés, offices, or any space that needs a
                creative touch.
              </p>
              <ul role="list" className="list">
                <li className="list-item">
                  <div className="paragraph-16 text-white">
                    Unique designs tailored to your space and vision
                  </div>
                </li>
                <li>
                  <div className="paragraph-16 text-white">High-quality, durable finishes</div>
                </li>
                <li>
                  <div className="paragraph-16 text-white">
                    Crafted with attention to detail for lasting impact
                  </div>
                </li>
              </ul>
            </div>
            <div className="benefits-card benfits-card-black">
              <img
                src="/images/480712768_2939030426251531_6954782286018941187_n.jpg"
                loading="lazy"
                sizes="(max-width: 767px) 100vw, (max-width: 991px) 95vw, 940px"
                srcSet="/images/480712768_2939030426251531_6954782286018941187_n-p-500.jpg 500w, /images/480712768_2939030426251531_6954782286018941187_n-p-800.jpg 800w"
                alt="Hand-painted mural detail"
                className="benifit-card-image-big"
              />
            </div>
            <div className="benefits-card benfits-card-black">
              <img
                src="/images/480790789_2939030569584850_3441539139330128861_n.jpg"
                loading="lazy"
                sizes="(max-width: 767px) 100vw, (max-width: 991px) 95vw, 940px"
                srcSet="/images/480790789_2939030569584850_3441539139330128861_n-p-500.jpg 500w, /images/480790789_2939030569584850_3441539139330128861_n-p-800.jpg 800w, /images/480790789_2939030569584850_3441539139330128861_n-p-1080.jpg 1080w, /images/480790789_2939030569584850_3441539139330128861_n-p-1600.jpg 1600w"
                alt="Mural project by Creionescu"
                className="benifit-card-image-big"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
