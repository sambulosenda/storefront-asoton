import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { ProductVisual } from "@/components/cloth";
import { QuickAdd } from "@/components/quick-add";
import { clothOf } from "@/lib/cloths";
import { colourLine, formatMoney, isColourOption } from "@/lib/format";
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
  // The cloth leads the card's second line: the shop names what every piece is cut from. Only the
  // title and type decide it, as tags carry loose search words that would name the wrong cloth.
  const cloth = clothOf({ title: product.title, productType: product.productType })?.name ?? null;
  const detail = [cloth, colour].filter(Boolean).join(" · ");
  const price = formatMoney(product.priceRange.minVariantPrice);

  const second = product.cardImages?.nodes?.[1] ?? null;
  const swatches = colourSwatches(product);
  const photo = (
    <div className="absolute inset-0 flex items-center justify-center transition-transform duration-(--duration-slow) ease-(--ease-out-soft) group-hover:scale-[1.03]">
      <ProductVisual product={product} image={product.featuredImage} sizes={sizes} priority={priority} />
    </div>
  );

  return (
    <div className="group/card relative">
      <Link
        href={`/products/${product.handle}`}
        className={`group flex flex-col text-ink no-underline hover:text-ink ${variant === "grid" ? "gap-2.5 md:gap-3.5" : "gap-3"}`}
      >
        <div className="reveal relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-stone">
          {/* The photo moves into the product page's gallery when the card is opened. */}
          {/* Only grid cards carry the name: pages that also show a phone carousel would name the same piece twice. */}
          {variant === "grid" ? (
            <ViewTransition name={`product-${product.handle}`} share="morph" default="none">
              {photo}
            </ViewTransition>
          ) : (
            photo
          )}
          {/* A second look on hover, where there is one. */}
          {second && product.featuredImage && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-(--duration-medium) ease-(--ease-out-soft) group-hover:opacity-100">
              <Image src={second.url} alt="" fill sizes={sizes} className="object-cover" />
            </div>
          )}
          {badge && (
            <span
              className={`absolute z-10 bg-paper/90 px-1.5 py-0.5 font-semibold uppercase tracking-[0.14em] ${
                variant === "grid" ? "top-2.5 left-2.5 text-[10px] md:top-3.5 md:left-3.5 md:text-[11px]" : "top-3 left-3 text-[10px]"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        {variant === "grid" ? (
          <div className="flex flex-col gap-0.5 md:flex-row md:items-baseline md:justify-between md:gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] leading-[1.35] font-medium md:text-[15px] md:leading-normal">{product.title}</span>
              {cloth && <span className="text-[13px] text-ink-2 md:hidden">{cloth}</span>}
              {detail && <span className="hidden text-[13px] text-ink-2 md:block">{detail}</span>}
            </div>
            <span className="text-[13px] whitespace-nowrap text-ink-2 md:text-[15px] md:text-ink">{price}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            <span className="text-[14px] font-medium">{product.title}</span>
            <span className="text-[13px] text-ink-2">{[detail, price].filter(Boolean).join(" · ")}</span>
          </div>
        )}
        {swatches.length > 1 && (
          <span aria-hidden="true" className="-mt-1 flex gap-1.5">
            {swatches.slice(0, 6).map((c) => (
              <span key={c} className="size-2.5 rounded-full ring-1 ring-ink/15" style={{ backgroundColor: c }} />
            ))}
          </span>
        )}
      </Link>
      {variant === "grid" && (
        // Laid over the photo, outside the link, so its buttons aren't inside a link.
        <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[3/4]">
          <QuickAdd product={product} />
        </div>
      )}
    </div>
  );
}

/** The colours a piece comes in, as dots, when the store gives each colour a swatch. */
function colourSwatches(product: Product) {
  const colour = product.options.find((o) => isColourOption(o.name));
  return (colour?.optionValues ?? []).map((v) => v.swatch?.color).filter((c): c is string => Boolean(c));
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
