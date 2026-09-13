import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SOCIAL_IMAGE } from "@/lib/site";

const title = "Contact Creionescu — custom decorations & styling";
const description =
  "Get in touch about custom polystyrene decorations, window displays or interior styling. Email or message us on Facebook and Instagram.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
      { property: "og:image", content: SOCIAL_IMAGE },
      { name: "twitter:image", content: SOCIAL_IMAGE },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <section id="Contact" className="contact-hero-section">
      <div className="w-layout-blockcontainer container w-container">
        <h1 className="heading-h2 margin-bottom-32">Contact us</h1>
        <div className="contact-form-block w-form">
          <form
            className="contact-form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const data = new FormData(form);
              const subject = encodeURIComponent(String(data.get("subject") ?? "Website enquiry"));
              const body = encodeURIComponent(
                `${data.get("message") ?? ""}\n\n${data.get("firstName") ?? ""} ${data.get("lastName") ?? ""}\n${data.get("email") ?? ""}`,
              );
              window.location.href = `mailto:theflowerhouseeee@gmail.com?subject=${subject}&body=${body}`;
              setSent(true);
            }}
          >
            <div className="contact-side-container">
              <p className="paragraph-20">
                Need help? Contact us for details about custom decorations or any special requests!
              </p>
              <div className="contact-list">
                <div className="contact-list-item">
                  <a href="mailto:theflowerhouseeee@gmail.com" className="contact-links">
                    theflowerhouseeee@gmail.com
                  </a>
                </div>
                <div className="contact-list-item">
                  <a
                    href="https://www.facebook.com/creionelly"
                    target="_blank"
                    rel="noreferrer"
                    className="contact-links"
                  >
                    DM at Creioonescu
                  </a>
                </div>
                <div className="contact-list-item">
                  <a
                    href="https://www.instagram.com/creionescu.ro"
                    target="_blank"
                    rel="noreferrer"
                    className="contact-links"
                  >
                    DM at creionescu.ro
                  </a>
                </div>
              </div>
            </div>
            <div className="form-elements-grid">
              <div className="_100-width">
                <label htmlFor="firstName" className="field-label">
                  First Name*
                </label>
                <input
                  className="text-field w-input"
                  maxLength={256}
                  name="firstName"
                  id="firstName"
                  placeholder="First Name"
                  type="text"
                  required
                />
              </div>
              <div className="_100-width">
                <label htmlFor="lastName" className="field-label">
                  Last Name
                </label>
                <input
                  className="text-field w-input"
                  maxLength={256}
                  name="lastName"
                  id="lastName"
                  placeholder="Last Name"
                  type="text"
                />
              </div>
              <div className="_100-width">
                <label htmlFor="email" className="field-label">
                  Email Address *
                </label>
                <input
                  className="text-field w-input"
                  maxLength={256}
                  name="email"
                  id="email"
                  placeholder="Email Address"
                  type="email"
                  required
                />
              </div>
              <div className="_100-width">
                <label htmlFor="subject" className="field-label">
                  Subject *
                </label>
                <input
                  className="text-field w-input"
                  maxLength={256}
                  name="subject"
                  id="subject"
                  placeholder="Subject"
                  type="text"
                  required
                />
              </div>
              <div className="_100-width">
                <label htmlFor="message" className="field-label">
                  Message *
                </label>
                <textarea
                  placeholder="Message"
                  maxLength={5000}
                  id="message"
                  name="message"
                  required
                  className="text-field text-field-area w-input"
                />
              </div>
              <div className="_100-width">
                <input type="submit" className="primary-button w-button" value="Send Message" />
              </div>
            </div>
          </form>
          {sent ? (
            <div className="success-message">
              <div className="paragraph-18">
                Thank you for contacting us. Your email app should now open with your message.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
