"use client";

import { useState } from "react";
import { useStore } from "@/components/store-provider";
import { isSizeOption } from "@/lib/format";
import { sortedSizes } from "@/lib/sizes";
import type { Product } from "@/lib/shopify/types";

/**
 * The sizes a card can add to the bag straight away: only for pieces whose one choice is the size.
 * A piece that also asks for a colour or "ready to ship or made to order" opens its page instead.
 */
export function quickSizes(product: Product) {
  const variants = product.cardVariants?.nodes ?? [];
  if (!product.availableForSale || variants.length < 2) return null;
  const size = product.options.find((o) => isSizeOption(o.name));
  if (!size) return null;
  if (product.options.some((o) => o !== size && o.optionValues.length > 1)) return null;
  const byValue = new Map(
    variants.map((v) => [v.selectedOptions.find((o) => o.name === size.name)?.value ?? "", v] as const),
  );
  const sizes = sortedSizes(size.optionValues.map((v) => v.name))
    .map((s) => ({ ...s, variant: byValue.get(s.value) }))
    .filter((s) => s.variant);
  return sizes.length > 1 ? sizes : null;
}

/** Sizes that rise over the photo when the card is hovered, on screens with a mouse. */
export function QuickAdd({ product }: { product: Product }) {
  const { add, open } = useStore();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const sizes = quickSizes(product);
  if (!sizes) return null;

  const choose = async (variantId: string) => {
    setBusy(variantId);
    setError(false);
    try {
      const result = await add(variantId);
      if (result.cart && !result.error) open("cart");
      else setError(true);
    } catch {
      setError(true);
    }
    setBusy(null);
  };

  return (
    <div
      role="group"
      aria-label={`Add ${product.title} to your bag`}
      className="pointer-events-none absolute inset-x-2.5 bottom-2.5 z-20 hidden translate-y-2 bg-paper/95 p-3 opacity-0 backdrop-blur-sm transition duration-(--duration-medium) ease-(--ease-out-soft) group-hover/card:pointer-events-auto group-hover/card:translate-y-0 group-hover/card:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:md:block"
    >
      <p className="pb-2 text-[11px] font-semibold tracking-[0.14em] uppercase">{error ? "Couldn’t add. Try again" : "Quick add"}</p>
      <div className="flex flex-wrap gap-1.5">
        {sizes.map((s) => {
          const available = s.variant!.availableForSale;
          return (
            <button
              key={s.value}
              type="button"
              // A shortcut for mouse users; keyboards reach the same sizes on the product page.
              tabIndex={-1}
              disabled={!available || busy !== null}
              aria-label={available ? `Add size ${s.full}` : `Size ${s.full}, sold out`}
              onClick={() => choose(s.variant!.id)}
              className={`h-9 min-w-10 cursor-pointer border px-2 text-[13px] transition-colors duration-(--duration-quick) ${
                available ? "border-line hover:border-ink hover:bg-ink hover:text-paper" : "cursor-not-allowed border-line-soft text-muted line-through"
              } ${busy === s.variant!.id ? "bg-ink text-paper" : ""}`}
            >
              {s.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}
