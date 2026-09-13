# Creionescu — full webshop, same design

Turn the existing Creionescu site into a working shop with a cart, guest checkout, NETOPIA card payments and an owner admin area. The look stays as it is today: same layout, navigation, fonts, colours, cards, images and animations.

## What you'll be able to do

- Visitors browse the site, open a product, add it to the cart, change quantities and remove items. The cart counter in the top bar updates live and survives a page refresh.
- No customer accounts. Checkout asks only for email, name, phone and a Romanian delivery address (city, county, postal code).
- Before paying, the customer sees products, quantities, subtotal, delivery and total. Totals are recalculated on our side from stored prices.
- Card payment through NETOPIA in test mode; orders only become "paid" once NETOPIA confirms it directly to our server.
- Confirmation page with order number and summary; the cart empties only after a completed order.
- A password-protected owner area for products (add, edit, archive, images, prices, descriptions, stock) and orders (contents, totals, buyer details, payment status).

## The six existing products, kept as-is

Figurines: Tinkerbell Fairy Set, "Capra cu Trei Iezi" Figurine Set, Bird Figurines Set.
Props: Candy Set 1, Pumpkin Props, Candy Set 2.

Same photos, same descriptions, moved into the database so you can edit them yourself later. Nothing is deleted.

## Things I need from you

1. **Prices in lei** for each of the six products (you said you'd supply these). Until then I'll load them with a straight 1 USD = 5 lei conversion so the shop is usable, and you can correct them in the admin area or tell me the numbers.
2. **Delivery fee** — one flat amount per order in lei (I'll use 25 lei until you say otherwise).
3. **NETOPIA test credentials** — you don't have them yet. I'll build the full payment flow and then tell you exactly which values to request from NETOPIA and where to paste them. No made-up credentials will be committed.

## Social sharing and page titles

The old template branding ("ShupperShopX | Webflow HTML website template", the photography-shop description, the template preview image) is removed everywhere. Each page gets a real Creionescu title and description, and shared links use one of your own product photos as the preview image. Product pages get their own title, description and photo.

## Pages and links

Home, Products, the two shop categories, Services, Blog, Contact, Cart, Checkout, Confirmation — all keep working at their current addresses where possible; old Webflow addresses (e.g. `all-products.html`, `figurines.html`) redirect to the new clean ones.

---

## Technical notes

- **Backend**: Lovable Cloud. Tables: `categories`, `products`, `product_images`, `orders`, `order_items`, `payments`, `admin_roles` (separate role table, RLS on every table). Public read policies expose only active products; orders are never publicly readable.
- **Seed**: one migration containing schema, grants, policies and literal INSERTs for the six products, their categories and images.
- **Frontend**: Webflow CSS (`normalize.css`, `webflow.css`, `creionescu.webflow.css`) copied into the project and imported once; images copied to `public/images` keeping filenames and `srcset` so responsive images and paths keep working. Markup ported into TanStack Start route components — nav, footer, hero, product card, product grid as shared components. The Webflow IX2 scroll/hover animations are reproduced with the existing classes plus a small in-view helper.
- **Cart**: client-side context persisted to `localStorage`, hydration-safe; cart badge reads from it.
- **Checkout**: server function validates the address with Zod, re-reads prices from the database, computes subtotal + flat shipping + total, creates the order (`pending`) with a generated order number, then initiates NETOPIA.
- **NETOPIA**: server-only. Start-payment call inside a server function; return URL as a normal route; confirmation as a public server route (`/api/public/netopia/ipn`) that verifies the notification server-side, is idempotent per order/transaction, and writes the final payment status. Environment-driven base URL and credentials so switching to live is a secrets change only. Browser never sees credentials, and reaching the success page never marks an order paid.
- **Admin**: routes under an authenticated layout, access gated by the `admin` role checked server-side; product image uploads to Cloud storage.
- **Metadata**: per-route `head()` with title/description/og/twitter/canonical; absolute og:image only where a real hosted product photo exists; existing `favicon.svg` / `webclip.svg` wired up.

## Build order

1. Cloud backend + schema + seeded products.
2. Design system port: assets, CSS, nav/footer, home, products, category and product pages.
3. Cart + cart badge.
4. Checkout with server-side totals and order creation.
5. NETOPIA integration (test mode) + return and confirmation endpoints.
6. Admin area.
7. Metadata cleanup, redirects, mobile and end-to-end pass.
