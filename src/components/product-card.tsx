import Link from "next/link";
import { ProductVisual } from "@/components/cloth";
import { colourLine, formatMoney } from "@/lib/format";
import type { Product } from "@/lib/shopify/types";

function badgeFor(product: Product) {
  if (!product.availableForSale) return "Sold out";
  if (product.tags.some((t) => t.toLowerCase() === "new")) return "New";
  return null;
}

/**
 * - `grid`: collection and New in grids. Desktop shows name and colour on the left, price on the
 *   right; phones stack name over price.
 * - `compact`: carousels and search results, with colour and price on one line under the name.
 */
export function ProductCard({
  product,
  variant = "grid",
  sizes = "(min-width: 768px) 25vw, 50vw",
  priority,
}: {
  product: Product;
  variant?: "grid" | "compact";
  sizes?: string;
  priority?: boolean;
}) {
  const badge = badgeFor(product);
  const colour = colourLine(product.options);
  const price = formatMoney(product.priceRange.minVariantPrice);

  return (
    <Link
      href={`/products/${product.handle}`}
      className={`group flex flex-col text-ink no-underline hover:text-ink ${
        variant === "grid" ? "gap-2.5 md:gap-3.5" : "gap-3"
      }`}
    >
      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-stone">
        <ProductVisual product={product} image={product.featuredImage} sizes={sizes} priority={priority} />
        {badge && (
          <span
            className={`absolute z-10 font-semibold uppercase tracking-[0.14em] ${
              variant === "grid"
                ? "top-2.5 left-2.5 text-[10px] md:top-3.5 md:left-3.5 md:text-[11px]"
                : "top-3 left-3 text-[10px]"
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      {variant === "grid" ? (
        <div className="flex flex-col gap-0.5 md:flex-row md:items-baseline md:justify-between md:gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[14px] leading-[1.35] font-medium md:text-[15px] md:leading-normal">
              {product.title}
            </span>
            {colour && <span className="hidden text-[13px] text-ink-2 md:block">{colour}</span>}
          </div>
          <span className="text-[13px] whitespace-nowrap text-ink-2 md:text-[15px] md:text-ink">{price}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          <span className="text-[14px] font-medium">{product.title}</span>
          <span className="text-[13px] text-ink-2">{colour ? `${colour} · ${price}` : price}</span>
        </div>
      )}
    </Link>
  );
}

/** Four-up grid on desktop (auto-fit at 260px), two-up on phones. */
export function ProductGrid({
  products,
  wide = false,
  tight = false,
  className = "",
}: {
  products: Product[];
  wide?: boolean;
  /** 40px rows (home, product page) instead of the collection's 48px. */
  tight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-6 ${tight ? "md:gap-y-10" : "md:gap-y-12"} ${
        wide
          ? "md:grid-cols-[repeat(auto-fill,minmax(min(480px,100%),1fr))]"
          : "md:grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))]"
      } ${className}`}
    >
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={i < 4}
          sizes={wide ? "(min-width: 768px) 50vw, 50vw" : "(min-width: 768px) 25vw, 50vw"}
        />
      ))}
    </div>
  );
}

/** Horizontal snap carousel used on phones. */
export function ProductRail({ products }: { products: Product[] }) {
  return (
    <div className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4">
      {products.map((product) => (
        <div key={product.id} className="w-60 flex-none snap-start">
          <ProductCard product={product} variant="compact" sizes="240px" />
        </div>
      ))}
    </div>
  );
}
