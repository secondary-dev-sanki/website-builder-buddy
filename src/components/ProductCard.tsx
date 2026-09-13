import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { formatMoney } from "@/lib/money";
import type { CatalogProduct } from "@/lib/catalog.functions";

export function ProductCard({ product, delay = 0 }: { product: CatalogProduct; delay?: number }) {
  const image = product.images[0];
  return (
    <Reveal delay={delay}>
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="udesly-card-v-2 w-inline-block"
      >
        {image ? (
          <img
            src={image.url}
            {...(image.srcset ? { srcSet: image.srcset } : {})}
            sizes="(max-width: 767px) 100vw, 33vw"
            loading="lazy"
            alt={image.alt ?? product.name}
            className="udesly-image-cover"
          />
        ) : null}
        <h3 className="heading">{product.name}</h3>
        <p className="udesly-paragraph-medium udesly-text-color-neutral-500">
          {product.shortDescription}
        </p>
        <p className="udesly-paragraph-medium udesly-text-color-neutral-500">
          {formatMoney(product.priceCents)}
        </p>
      </Link>
    </Reveal>
  );
}
