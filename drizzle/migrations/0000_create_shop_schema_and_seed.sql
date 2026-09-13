-- Roles (admin only; no customer accounts)
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_description text,
  description text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  currency text NOT NULL DEFAULT 'RON',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  in_stock boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active products are public" ON public.products FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Admins read all products" ON public.products FOR SELECT TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Product images
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  srcset text,
  alt text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_images_product_id_idx ON public.product_images(product_id);
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product images are public" ON public.product_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage product images" ON public.product_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders (guest checkout; never publicly readable)
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'unpaid',
  email text NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  county text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'RO',
  notes text,
  currency text NOT NULL DEFAULT 'RON',
  subtotal_cents integer NOT NULL DEFAULT 0,
  shipping_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  access_token text NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read orders" ON public.orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_slug text NOT NULL,
  unit_price_cents integer NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  line_total_cents integer NOT NULL,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_items_order_id_idx ON public.order_items(order_id);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read order items" ON public.order_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Payments (NETOPIA); idempotent by provider notification
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'netopia',
  environment text NOT NULL DEFAULT 'sandbox',
  provider_payment_id text,
  status text NOT NULL DEFAULT 'initiated',
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'RON',
  error_code text,
  error_message text,
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX payments_provider_payment_id_key
  ON public.payments(provider, provider_payment_id) WHERE provider_payment_id IS NOT NULL;
CREATE INDEX payments_order_id_idx ON public.payments(order_id);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read payments" ON public.payments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Idempotent log of provider notifications
CREATE TABLE public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'netopia',
  event_key text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, event_key)
);
GRANT SELECT ON public.payment_events TO authenticated;
GRANT ALL ON public.payment_events TO service_role;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read payment events" ON public.payment_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Order number sequence
CREATE SEQUENCE public.order_number_seq START 1000;
GRANT USAGE, SELECT ON SEQUENCE public.order_number_seq TO service_role;

-- Seed the existing catalogue
INSERT INTO public.categories (slug, name, description, sort_order) VALUES
  ('figurines', 'Polystyrene figurines', 'Polystyrene figurine sets and individual pieces', 1),
  ('props', 'Polystyrene decorative props', 'Life-sized Polystyrene decorative props', 2);

INSERT INTO public.products (slug, name, short_description, description, price_cents, category_id, stock, sort_order) VALUES
  ('tinkerbell-fairy-set', 'Tinkerbell Fairy Set',
   'Handmade Tinkerbell fairy figurine, crafted from polystyrene and perfect for themed decor.',
   'Handmade Tinkerbell fairy figurine, crafted from polystyrene and perfect for themed decor. Each piece is shaped, coated and painted by hand in our workshop, making it a durable and lightweight decoration for shop windows, events and themed interiors.',
   50000, (SELECT id FROM public.categories WHERE slug='figurines'), 5, 1),
  ('capra-cu-trei-iezi-figurine-set', '“Capra cu Trei Iezi” Figurine Set',
   'figurine set inspired by the classic Romanian story',
   'A figurine set inspired by the classic Romanian story “Capra cu trei iezi”. Handcrafted from polystyrene and finished by hand, ideal for storytelling displays, kindergartens, events and seasonal window arrangements.',
   75000, (SELECT id FROM public.categories WHERE slug='figurines'), 5, 2),
  ('bird-figurines-set', 'Bird Figurines Set',
   'Colorful polystyrene bird figurines, handcrafted for playful and eye-catching decorations.',
   'Colorful polystyrene bird figurines, handcrafted for playful and eye-catching decorations. Lightweight, easy to hang or place, and finished in vivid colours that hold up well under display lighting.',
   60000, (SELECT id FROM public.categories WHERE slug='figurines'), 5, 3),
  ('candy-set-1', 'Candy Set 1',
   'Handcrafted polystyrene candy props, perfect for decor displays.',
   'Handcrafted polystyrene candy props, perfect for decor displays. Oversized sweets that instantly turn a window or a party corner into a candy world, made to be light enough to hang and sturdy enough to reuse season after season.',
   100000, (SELECT id FROM public.categories WHERE slug='props'), 5, 1),
  ('pumpkin-props', 'Pumpkin Props',
   'Life-sized polystyrene pumpkins, ideal for seasonal or themed decorations.',
   'Life-sized polystyrene pumpkins, ideal for seasonal or themed decorations. Hand-carved and painted for a realistic finish, perfect for autumn windows, Halloween sets and harvest-themed events.',
   250000, (SELECT id FROM public.categories WHERE slug='props'), 3, 2),
  ('candy-set-2', 'Candy Set 2',
   'Vibrant polystyrene candy decorations, handcrafted for eye-catching displays.',
   'Vibrant polystyrene candy decorations, handcrafted for eye-catching displays. A bolder colour palette than Candy Set 1, designed to work as a standalone display or alongside our other candy props.',
   150000, (SELECT id FROM public.categories WHERE slug='props'), 4, 3);

INSERT INTO public.product_images (product_id, url, srcset, alt, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug='tinkerbell-fairy-set'),
   '/images/WhatsApp-Image-2025-07-18-at-20.20.32_900d0569.jpg',
   '/images/WhatsApp-Image-2025-07-18-at-20.20.32_900d0569-p-500.jpg 500w, /images/WhatsApp-Image-2025-07-18-at-20.20.32_900d0569-p-800.jpg 800w, /images/WhatsApp-Image-2025-07-18-at-20.20.32_900d0569-p-1080.jpg 1080w',
   'Tinkerbell Fairy Set polystyrene figurine', 1),
  ((SELECT id FROM public.products WHERE slug='capra-cu-trei-iezi-figurine-set'),
   '/images/WhatsApp-Image-2025-07-18-at-20.20.28_4ba6a545.jpg',
   '/images/WhatsApp-Image-2025-07-18-at-20.20.28_4ba6a545-p-500.jpg 500w, /images/WhatsApp-Image-2025-07-18-at-20.20.28_4ba6a545-p-800.jpg 800w, /images/WhatsApp-Image-2025-07-18-at-20.20.28_4ba6a545-p-1080.jpg 1080w',
   '“Capra cu Trei Iezi” polystyrene figurine set', 1),
  ((SELECT id FROM public.products WHERE slug='bird-figurines-set'),
   '/images/WhatsApp-Image-2025-07-18-at-20.20.41_14f38d2b.jpg',
   '/images/WhatsApp-Image-2025-07-18-at-20.20.41_14f38d2b-p-500.jpg 500w, /images/WhatsApp-Image-2025-07-18-at-20.20.41_14f38d2b-p-800.jpg 800w',
   'Colorful polystyrene bird figurines', 1),
  ((SELECT id FROM public.products WHERE slug='candy-set-1'),
   '/images/WhatsApp-Image-2025-07-18-at-18.34.51_18171659.jpg',
   '/images/WhatsApp-Image-2025-07-18-at-18.34.51_18171659-p-500.jpg 500w, /images/WhatsApp-Image-2025-07-18-at-18.34.51_18171659-p-800.jpg 800w',
   'Handcrafted polystyrene candy props', 1),
  ((SELECT id FROM public.products WHERE slug='pumpkin-props'),
   '/images/WhatsApp-Image-2025-07-18-at-18.35.00_0b80b96e.jpg',
   '/images/WhatsApp-Image-2025-07-18-at-18.35.00_0b80b96e-p-500.jpg 500w, /images/WhatsApp-Image-2025-07-18-at-18.35.00_0b80b96e-p-800.jpg 800w',
   'Life-sized polystyrene pumpkin props', 1),
  ((SELECT id FROM public.products WHERE slug='candy-set-2'),
   '/images/WhatsApp-Image-2025-07-21-at-17.56.28_6297276e.jpg',
   '/images/WhatsApp-Image-2025-07-21-at-17.56.28_6297276e-p-500.jpg 500w, /images/WhatsApp-Image-2025-07-21-at-17.56.28_6297276e-p-800.jpg 800w',
   'Vibrant polystyrene candy decorations', 1);