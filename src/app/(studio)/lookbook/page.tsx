import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { colourLine, formatMoney } from "@/lib/format";
import { getCountry } from "@/lib/market";
import { getCampaign, getCollectionOrAll, getLooks, type Look, type Product } from "@/lib/shopify";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Lookbook",
  description: `Looks from ${site.brand}: contemporary African clothing for women and men, styled head to toe.`,
  alternates: { canonical: "/lookbook" },
};

// Each look gets the next of the design's grounds while it has no photo.
const TONES = ["#2B3049", "#3E2A2E", "#4A3F3A", "#2F3438"];

function PieceRow({ piece }: { piece: Product }) {
  const colour = colourLine(piece.options);
  return (
    <Link href={`/products/${piece.handle}`} className="flex items-baseline justify-between gap-4 py-3.5 text-[15px] no-underline">
      <span>
        <span className="font-medium">{piece.title}</span>
        {colour && <span className="text-[13px] text-ink-2"> · {colour}</span>}
      </span>
      <span className="whitespace-nowrap">{formatMoney(piece.priceRange.minVariantPrice)}</span>
    </Link>
  );
}

export default function LookbookPage() {
  return (
    <>
      <Hero />

      {/* Prices follow the shopper's country, so the looks render per request. */}
      <Suspense fallback={<div className="min-h-dvh" />}>
        <Looks />
      </Suspense>

      <section className="border-t border-line">
        <div className="page-x flex flex-col items-center gap-6 py-20 text-center md:py-24">
          <p className="font-display text-[clamp(32px,3.4vw,48px)] leading-[1.05]">Every piece, in one place</p>
          <Link href="/collections/new-in" className="btn btn-ink md:px-9">
            Shop new in
          </Link>
        </div>
      </section>
    </>
  );
}

/**
 * The "lookbook" campaign metaobject sets the hero's words and photo. Without one, the hero
 * is titled Lookbook and uses the first look's photo, or the newest product's.
 */
async function Hero() {
  const [campaign, looks, newIn] = await Promise.all([
    getCampaign("lookbook"),
    getLooks(),
    getCollectionOrAll({ handle: "new-in", first: 1 }),
  ]);
  const image =
    campaign?.image ?? looks[0]?.image ?? looks[0]?.products[0]?.featuredImage ?? newIn.products[0]?.featuredImage ?? null;

  return (
    <>
      <section className="relative aspect-[4/5] max-h-[820px] w-full overflow-hidden bg-[#1F2438] text-paper md:aspect-[16/9]">
        {image && (
          <>
            <Image src={image.url} alt={image.altText ?? ""} fill preload sizes="100vw" className="object-cover" />
            {/* Keeps the white type readable on light photos. */}
            <div className="absolute inset-0 bg-linear-to-t from-[#1F2438]/80 via-[#1F2438]/25 to-transparent" />
          </>
        )}
        <div className="absolute bottom-[clamp(24px,4vw,56px)] left-[clamp(16px,4vw,48px)] flex flex-col gap-4 pr-4">
          <span className="text-[12px] tracking-[0.16em] text-[#C5C9D8] uppercase">{campaign?.label ?? site.brand}</span>
          <h1 className="font-display text-[clamp(56px,9vw,136px)] leading-[0.9] tracking-[-0.02em]">
            {campaign?.headline ?? "Lookbook"}
          </h1>
        </div>
      </section>

      {campaign?.body && (
        <section className="mx-auto max-w-[760px] px-[clamp(16px,4vw,48px)] py-16 text-center md:py-24">
          <p className="font-display text-[clamp(24px,2.2vw,32px)] leading-[1.35]">{campaign.body}</p>
        </section>
      )}
    </>
  );
}

/** The "look" metaobjects, or until there are some, the newest pieces one at a time. */
async function Looks() {
  const country = await getCountry();
  const looks = await getLooks(country);
  const fromProducts = looks.length === 0;
  const shown: Look[] = fromProducts
    ? (await getCollectionOrAll({ handle: "new-in", first: 4, country })).products.map((p) => ({
        handle: p.handle,
        title: p.title,
        body: null,
        image: p.featuredImage,
        products: [p],
      }))
    : looks;

  return (
    <div className={fromProducts ? "pt-16 md:pt-24" : undefined}>
      {shown.map((look, i) => {
        const image = look.image ?? look.products[0]?.featuredImage ?? null;
        const flip = i % 2 === 1;
        return (
          <section
            key={look.handle}
            aria-labelledby={`look-${i + 1}`}
            className={`page-x flex flex-wrap items-end gap-x-16 gap-y-10 pb-20 md:pb-[120px] ${flip ? "flex-wrap-reverse" : ""}`}
          >
            <div
              style={{ backgroundColor: TONES[i % TONES.length] }}
              className={`relative aspect-[4/5] max-h-[820px] min-w-0 flex-[3_1_520px] overflow-hidden ${flip ? "order-2" : ""}`}
            >
              {image && (
                <Image
                  src={image.url}
                  alt={image.altText ?? look.title}
                  fill
                  sizes="(min-width: 768px) 60vw, 100vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex max-w-[420px] min-w-0 flex-[2_1_320px] flex-col gap-5">
              <span className="text-[12px] tracking-[0.14em] text-ink-2">
                {fromProducts ? "New in" : `Look ${String(i + 1).padStart(2, "0")}`}
              </span>
              <h2 id={`look-${i + 1}`} className="font-display text-[36px] leading-[1.05] md:text-[40px]">
                {look.title}
              </h2>
              {look.body && <p className="leading-[1.6] text-ink-2">{look.body}</p>}
              {look.products.length > 0 && (
                <>
                  <ul className="border-t border-line">
                    {look.products.map((piece) => (
                      <li key={piece.handle} className="border-b border-line">
                        <PieceRow piece={piece} />
                      </li>
                    ))}
                  </ul>
                  <Link href={`/products/${look.products[0].handle}`} className="btn btn-ink self-start">
                    {fromProducts ? "Shop now" : "Shop the look"}
                  </Link>
                </>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
