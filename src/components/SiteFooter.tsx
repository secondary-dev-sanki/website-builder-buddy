import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <div className="footer-section">
      <div className="container container-footer">
        <div className="footer-newsletter-wrapper">
          <div className="footer-newsletter-text-wrapper">
            <div className="heading-h3 margin-bottom-16">Join our newsletter</div>
            <div className="paragraph-18">
              Join our list for inspiration, decor tips, and exclusive deals.
            </div>
          </div>
          <div className="footer-form-block w-form">
            <form
              className="footer-form"
              onSubmit={(event) => {
                event.preventDefault();
                event.currentTarget.reset();
              }}
            >
              <input
                className="text-field w-input"
                maxLength={256}
                name="email"
                placeholder="Enter your email"
                type="email"
                required
              />
              <input type="submit" className="primary-button primary-button-slim w-button" value="Subscribe" />
              <div className="paragraph-16">We care about your data.</div>
            </form>
          </div>
        </div>
        <div className="w-layout-grid footer-grid">
          <div className="footer-company-container">
            <p className="footer-title">Follow us</p>
            <div className="w-layout-grid footer-social-links-grid">
              <a
                href="https://www.instagram.com/creionescu.ro"
                target="_blank"
                rel="noreferrer"
                className="footer-social-link w-inline-block"
              >
                <img src="/images/Instagram.svg" loading="lazy" alt="Instagram logo" />
              </a>
              <a
                href="https://www.facebook.com/creionelly"
                target="_blank"
                rel="noreferrer"
                className="footer-social-link w-inline-block"
              >
                <img src="/images/Facebook.svg" loading="lazy" alt="Facebook logo" />
              </a>
            </div>
          </div>
          <div className="footer-link-list">
            <div className="footer-links-heading">Product</div>
            <Link to="/products" className="footer-links w-inline-block">
              <div>Shop</div>
            </Link>
            <Link to="/services" className="footer-links w-inline-block">
              <div>Services</div>
            </Link>
          </div>
          <div className="footer-link-list">
            <div className="footer-links-heading">Company</div>
            <Link to="/blog" className="footer-links w-inline-block">
              <div>Blog</div>
            </Link>
            <Link to="/contact" className="footer-links w-inline-block">
              <div>Contact</div>
            </Link>
            <Link to="/cart" className="footer-links w-inline-block">
              <div>Cart</div>
            </Link>
          </div>
        </div>
        <div className="footer-bottom-links">
          <div className="paragraph-16">© {new Date().getFullYear()} Creionescu</div>
        </div>
      </div>
    </div>
  );
}
