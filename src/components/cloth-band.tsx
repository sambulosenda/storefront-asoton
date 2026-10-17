"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductVisual } from "@/components/cloth";
import { ArrowRight } from "@/components/icons";
import type { StockedCloth } from "@/lib/catalog";

const LINE = "border-[rgba(245,244,241,0.22)]";

/**
 * "Start with the cloth": the cloths the store has pieces in, on the indigo band, each previewed
 * with one of those pieces. Hover or focus a cloth to preview it.
 */
export function ClothBand({ cloths }: { cloths: StockedCloth[] }) {
  const [active, setActive] = useState(0);
  if (cloths.length === 0) return null;
  const [first] = cloths;
  const current = cloths[active] ?? first;

  const heading = (
    <>
      Start with the <em>cloth</em>.
    </>
  );
  const intro = "Every fabric has a place, a technique and a history. Choose the one that speaks to you, then find the piece.";

  return (
    <section aria-label="Shop by cloth" className="bg-indigo text-paper">
      {/* Phones: one preview, then a list of links. */}
      <div className="px-4 py-16 md:hidden">
        <div className="flex flex-col gap-3.5">
          <span className="text-[11px] tracking-[0.16em] text-[#C5C9D8] uppercase">Shop by cloth</span>
          <h2 className="font-display text-[40px] leading-[1.05] tracking-[-0.01em]">
            {heading}
          </h2>
          <p className="leading-[1.6] text-[#C5C9D8]">{intro}</p>
        </div>
        <Link
          href={`/products/${first.product.handle}`}
          aria-label={first.product.title}
          className="relative mt-8 flex h-[448px] items-center justify-center overflow-hidden bg-stone"
        >
          <ProductVisual product={first.product} image={first.product.featuredImage} sizes="100vw" drawingWidth="66%" />
        </Link>
        <p className="mt-3 mb-6 text-[13px] leading-[1.6] text-[#C5C9D8]">
          Shown: {first.product.title}. {first.caption}
        </p>
        <ul className={`border-t ${LINE}`}>
          {cloths.map((cloth) => (
            <li key={cloth.key} className={`border-b ${LINE}`}>
              <Link href={cloth.href} className="flex min-h-[72px] items-center justify-between gap-3 text-paper no-underline hover:text-paper">
                <span className="flex flex-col">
                  <span className="font-display text-[26px] leading-[1.15]">{cloth.name}</span>
                  <span className="text-[13px] text-[#C5C9D8]">
                    {cloth.technique} · {cloth.country}
                  </span>
                </span>
                <ArrowRight size={18} />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Tablet and desktop */}
      <div className="page-x hidden flex-wrap items-start gap-16 py-[120px] md:flex">
        <div className="flex min-w-0 flex-[6_1_480px] flex-col gap-12">
          <div className="flex max-w-[560px] flex-col gap-5">
            <span className="text-[12px] tracking-[0.16em] text-[#C5C9D8] uppercase">Shop by cloth</span>
            <h2 className="font-display text-[clamp(44px,4.4vw,64px)] leading-[1.02] tracking-[-0.01em]">
              {heading}
            </h2>
            <p className="text-[17px] leading-[1.6] text-[#C5C9D8]">{intro}</p>
          </div>
          <ul className={`border-t ${LINE}`}>
            {cloths.map((cloth, i) => (
              <li key={cloth.key} className={`border-b ${LINE}`}>
                <button
                  type="button"
                  aria-pressed={i === active}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={`grid w-full cursor-pointer grid-cols-[44px_minmax(0,1fr)_auto] items-baseline gap-4 py-[22px] text-left ${
                    i === active ? "text-paper" : "text-[#9AA1BC]"
                  }`}
                >
                  <span className="text-[12px] tracking-[0.12em]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="font-display text-[32px] leading-[1.1]">{cloth.name}</span>
                    <span className="text-[14px]">{cloth.technique}</span>
                  </span>
                  <span className="text-right text-[13px] tracking-[0.04em]">{cloth.origin}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex min-w-0 flex-[5_1_400px] flex-col gap-5">
          <Link
            href={`/products/${current.product.handle}`}
            className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-stone text-ink-2 no-underline hover:text-ink"
          >
            <ProductVisual
              key={current.product.handle}
              product={current.product}
              image={current.product.featuredImage}
              sizes="(min-width: 768px) 40vw, 100vw"
              drawingWidth="66%"
            />
            {/* The chip keeps the name readable on a white product photo. */}
            <span className="absolute bottom-4 left-5 bg-stone/85 px-1.5 py-0.5 text-[12px] tracking-[0.06em]">
              {current.product.title}
            </span>
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
            <p aria-live="polite" className="max-w-[400px] flex-[1_1_260px] text-[14px] leading-[1.6] text-[#C5C9D8]">
              {current.caption}
            </p>
            <Link
              href={current.href}
              className="inline-flex items-center gap-2.5 border-b border-paper pb-1.5 text-[13px] tracking-[0.12em] whitespace-nowrap text-paper uppercase no-underline hover:text-paper"
            >
              {current.shop}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
