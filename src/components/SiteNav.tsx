import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

export function SiteNav() {
  const { count, hydrated } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(hover: hover) and (min-width: 992px)");
    const update = () => setCanHover(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const closeAll = () => {
    setMenuOpen(false);
    setShopOpen(false);
  };

  return (
    <div
      data-collapse="medium"
      data-animation="default"
      data-duration="300"
      role="banner"
      className="nav-bar w-nav"
    >
      <div className="container navigation-container">
        <Link to="/" className="nav-logo w-inline-block" onClick={closeAll}>
          <img
            src="/images/logo_creion.png"
            loading="lazy"
            sizes="(max-width: 1280px) 100vw, 1280px"
            alt="Creionescu logo"
            srcSet="/images/logo_creion-p-500.png 500w, /images/logo_creion-p-800.png 800w, /images/logo_creion-p-1080.png 1080w"
            className="nav-logo-image"
          />
        </Link>

        <nav
          role="navigation"
          className="nav-links-conatiner w-nav-menu"
          style={menuOpen ? { display: "flex" } : undefined}
        >
          <div className="nav-inner-container">
            <div
              className={`nav-dropdown w-dropdown ${shopOpen ? "w--open" : ""}`}
              onMouseEnter={canHover ? () => setShopOpen(true) : undefined}
              onMouseLeave={canHover ? () => setShopOpen(false) : undefined}
            >
              <div
                className={`nav-link nav-link-dropdown w-dropdown-toggle ${shopOpen ? "w--open" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => setShopOpen((open) => !open)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") setShopOpen((open) => !open);
                }}
              >
                <div>Shop</div>
                <div className="nav-arrow w-icon-dropdown-toggle" />
              </div>
              <nav
                className={`nav_dropdown-list w-dropdown-list ${shopOpen ? "w--open" : ""}`}
                style={shopOpen ? { display: "block" } : undefined}
              >
                <div className="nav_grid-dropdown-grid">
                  <Link
                    to="/category/$slug"
                    params={{ slug: "figurines" }}
                    className="nav_dropdown-card w-inline-block"
                    onClick={closeAll}
                  >
                    <div className="nav_dropdown-title">Polystyrene figurines</div>
                    <div className="paragraph-16 light-text">
                      Polystyrene figurine sets and individual pieces
                    </div>
                  </Link>
                  <Link
                    to="/category/$slug"
                    params={{ slug: "props" }}
                    className="nav_dropdown-card w-inline-block"
                    onClick={closeAll}
                  >
                    <div className="nav_dropdown-title">Polystyrene decorative props</div>
                    <div className="paragraph-16 light-text">
                      Life-sized Polystyrene decorative props
                    </div>
                  </Link>
                  <Link to="/services" className="nav_dropdown-card w-inline-block" onClick={closeAll}>
                    <div className="nav_dropdown-title">Interior Design</div>
                    <div className="paragraph-16 light-text">
                      Interior styling services (contact for details)
                    </div>
                  </Link>
                  <Link to="/blog" className="nav_dropdown-card w-inline-block" onClick={closeAll}>
                    <div className="nav_dropdown-title">Window Display Arrangements</div>
                    <div className="paragraph-16 light-text">
                      Custom Window Display Arrangements for various events or businesses
                    </div>
                  </Link>
                </div>
              </nav>
            </div>
            <Link to="/products" className="nav-link" onClick={closeAll}>
              Products
            </Link>
            <Link to="/services" className="nav-link" onClick={closeAll}>
              Services
            </Link>
            <Link to="/blog" className="nav-link" onClick={closeAll}>
              Blog
            </Link>
            <Link to="/contact" className="nav-link" onClick={closeAll}>
              Contact
            </Link>
          </div>
        </nav>

        <div className="card-wrapper">
          <Link
            to="/cart"
            className="primary-button primary-button-cart w-inline-block"
            aria-label="Open cart"
            onClick={closeAll}
          >
            <svg width="17px" height="17px" viewBox="0 0 17 17" aria-hidden="true">
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <path
                  d="M2.60592789,2 L0,2 L0,0 L4.39407211,0 L4.84288393,4 L16,4 L16,9.93844589 L3.76940945,12.3694378 L2.60592789,2 Z M15.5,17 C14.6715729,17 14,16.3284271 14,15.5 C14,14.6715729 14.6715729,14 15.5,14 C16.3284271,14 17,14.6715729 17,15.5 C17,16.3284271 16.3284271,17 15.5,17 Z M5.5,17 C4.67157288,17 4,16.3284271 4,15.5 C4,14.6715729 4.67157288,14 5.5,14 C6.32842712,14 7,14.6715729 7,15.5 C7,16.3284271 6.32842712,17 5.5,17 Z"
                  fill="currentColor"
                  fillRule="nonzero"
                />
              </g>
            </svg>
            <div className="cart-text w-inline-block">Cart</div>
            <div className="cart-quantity" aria-live="polite">
              {hydrated ? count : 0}
            </div>
          </Link>
        </div>

        <div
          className={`nav-menu-button w-nav-button ${menuOpen ? "w--open" : ""}`}
          role="button"
          tabIndex={0}
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") setMenuOpen((open) => !open);
          }}
        >
          <div className="navha-hamburger-button">
            <img
              src={menuOpen ? "/images/close.svg" : "/images/Hamburger-icon.svg"}
              loading="lazy"
              alt=""
              className="nav-hamburger-icon"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
