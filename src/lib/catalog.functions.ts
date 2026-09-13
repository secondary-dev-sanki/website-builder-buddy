import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type CatalogImage = { url: string; srcset: string | null; alt: string | null };

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  priceCents: number;
  stock: number;
  inStock: boolean;
  categorySlug: string | null;
  categoryName: string | null;
  images: CatalogImage[];
};

export type CatalogCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  products: CatalogProduct[];
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  price_cents: number;
  stock: number;
  in_stock: boolean;
  sort_order: number;
  categories: { slug: string; name: string } | null;
  product_images: { url: string; srcset: string | null; alt: string | null; sort_order: number }[];
};

const PRODUCT_SELECT =
  "id, slug, name, short_description, description, price_cents, stock, in_stock, sort_order, categories(slug, name), product_images(url, srcset, alt, sort_order)";

function toProduct(row: ProductRow): CatalogProduct {
  const images = [...row.product_images].sort((a, b) => a.sort_order - b.sort_order);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    priceCents: row.price_cents,
    stock: row.stock,
    inStock: row.in_stock && row.stock > 0,
    categorySlug: row.categories?.slug ?? null,
    categoryName: row.categories?.name ?? null,
    images: images.map((image) => ({ url: image.url, srcset: image.srcset, alt: image.alt })),
  };
}

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicServerClient } = await import("./supabase-server");
  const supabase = createPublicServerClient();

  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from("categories").select("id, slug, name, description, sort_order").order("sort_order"),
    supabase.from("products").select(PRODUCT_SELECT).eq("is_active", true).order("sort_order"),
  ]);

  if (categoriesResult.error) throw new Error(categoriesResult.error.message);
  if (productsResult.error) throw new Error(productsResult.error.message);

  const products = ((productsResult.data ?? []) as unknown as ProductRow[]).map(toProduct);

  const categories: CatalogCategory[] = (categoriesResult.data ?? []).map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    products: products.filter((product) => product.categorySlug === category.slug),
  }));

  return { categories, products };
});

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const { createPublicServerClient } = await import("./supabase-server");
    const supabase = createPublicServerClient();

    const { data: row, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!row) return { product: null, related: [] as CatalogProduct[] };

    const product = toProduct(row as unknown as ProductRow);

    const { data: relatedRows } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .neq("slug", data.slug)
      .limit(3);

    return {
      product,
      related: ((relatedRows ?? []) as unknown as ProductRow[]).map(toProduct),
    };
  });
