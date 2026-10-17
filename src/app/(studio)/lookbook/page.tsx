import type { Metadata } from "next";
import Link from "next/link";
import { colourLine, formatMoney } from "@/lib/format";
import { getProduct, type ProductDetail } from "@/lib/shopify";
import { story } from "@/lib/site";

export const metadata: Metadata = { title: "Lookbook" };

// Pieces are looked up by handle (Shopify's default handle is the title in kebab case).
// Pieces that aren't in the store yet are left out.
const LOOKS = [
  {
    title: "Indigo, head to toe",
    tone: "#2B3049",
    handles: ["adire-wrap-dress", "adire-headwrap"],
    search: "adire",
  },
  {
    title: "For the occasion",
    tone: "#3E2A2E",
    handles: ["aso-oke-agbada-set", "aso-oke-fila-cap"],
    search: "aso-oke",
  },
  {
    title: "Dressed as a pair",
    tones: ["#4A3F3A", "#2F3438"],
    handles: ["kente-panel-midi-skirt", "adire-kaftan", "wax-print-puff-sleeve-top", "adire-drawstring-trousers"],
    search: "kente",
  },
];

type Piece = Pick<ProductDetail, "handle" | "title" | "options" | "priceRange">;

function PieceRow({ piece, compact }: { piece: Piece; compact?: boolean }) {
  const colour = colourLine(piece.options);
  return (
    <Link href={`/products/${piece.handle}`} className="flex items-baseline justify-between gap-4 py-3.5 text-[15px] no-underline">
      {compact ? (
        <span>{piece.title}</span>
      ) : (
        <span>
          <span className="font-medium">{piece.title}</span>
          {colour && <span className="text-[13px] text-ink-2"> · {colour}</span>}
        </span>
      )}
      <span className="whitespace-nowrap">{formatMoney(piece.priceRange.minVariantPrice)}</span>
    </Link>
  );
}

export default async function LookbookPage() {
  const looks = await Promise.all(
    LOOKS.map(async (look) => ({
      ...look,
      pieces: (await Promise.all(look.handles.map(getProduct))).filter((p): p is ProductDetail => Boolean(p)),
    })),
  );
  const shopHref = (look: (typeof looks)[number]) =>
    look.pieces[0] ? `/products/${look.pieces[0].handle}` : `/search?q=${encodeURIComponent(look.search)}`;

  return (
    <>
      <section className="relative aspect-[4/5] max-h-[820px] w-full bg-[#1F2438] text-paper md:aspect-[16/9]">
        <div className="absolute bottom-[clamp(24px,4vw,56px)] left-[clamp(16px,4vw,48px)] flex flex-col gap-4 pr-4">
          <span className="text-[12px] tracking-[0.16em] text-[#C5C9D8] uppercase">Lookbook · Autumn/Winter 2026</span>
          <h1 className="font-display text-[clamp(56px,9vw,136px)] leading-[0.9] tracking-[-0.02em]">
            The <em>Indigo</em> Edit
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-[760px] px-[clamp(16px,4vw,48px)] py-16 text-center md:py-24">
        <p className="font-display text-[clamp(24px,2.2vw,32px)] leading-[1.35]">
          Three looks in adire, aso-oke and kente, photographed in {story.lookbookLocation}. Every piece is in the shop.
        </p>
      </section>

      {looks.slice(0, 2).map((look, i) => (
        <section
          key={look.title}
          aria-labelledby={`look-${i + 1}`}
          className={`page-x flex flex-wrap items-end gap-x-16 gap-y-10 pb-20 md:pb-[120px] ${i === 1 ? "flex-wrap-reverse" : ""}`}
        >
          <div
            style={{ backgroundColor: look.tone }}
            className={`aspect-[4/5] max-h-[820px] min-w-0 flex-[3_1_520px] ${i === 1 ? "order-2" : ""}`}
          />
          <div className="flex max-w-[420px] min-w-0 flex-[2_1_320px] flex-col gap-5">
            <span className="text-[12px] tracking-[0.14em] text-ink-2">Look {String(i + 1).padStart(2, "0")}</span>
            <h2 id={`look-${i + 1}`} className="font-display text-[36px] leading-[1.05] md:text-[40px]">
              {look.title}
            </h2>
            {look.pieces.length > 0 && (
              <ul className="border-t border-line">
                {look.pieces.map((piece) => (
                  <li key={piece.handle} className="border-b border-line">
                    <PieceRow piece={piece} />
                  </li>
                ))}
              </ul>
            )}
            <Link href={shopHref(look)} className="btn btn-ink self-start">
              Shop the look
            </Link>
          </div>
        </section>
      ))}

      <section aria-labelledby="look-3" className="page-x flex flex-col gap-8 pb-20 md:pb-[120px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] gap-6">
          {looks[2].tones!.map((tone) => (
            <div key={tone} style={{ backgroundColor: tone }} className="aspect-[4/5] max-h-[820px]" />
          ))}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-6">
          <div className="flex flex-col gap-3">
            <span className="text-[12px] tracking-[0.14em] text-ink-2">Look 03</span>
            <h2 id="look-3" className="font-display text-[36px] leading-[1.05] md:text-[40px]">
              {looks[2].title}
            </h2>
          </div>
          {looks[2].pieces.length > 0 ? (
            <ul className="grid max-w-[760px] flex-[1_1_520px] grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-x-8">
              {looks[2].pieces.map((piece) => (
                <li key={piece.handle} className="border-t border-line">
                  <PieceRow piece={piece} compact />
                </li>
              ))}
            </ul>
          ) : (
            <Link href={shopHref(looks[2])} className="btn btn-ink">
              Shop the look
            </Link>
          )}
        </div>
      </section>

      <section className="border-t border-line">
        <div className="page-x flex flex-col items-center gap-6 py-20 text-center md:py-24">
          <p className="font-display text-[clamp(32px,3.4vw,48px)] leading-[1.05]">Every piece, in one place</p>
          <Link href="/collections/new-in" className="btn btn-ink md:px-9">
            Shop the edit
          </Link>
        </div>
      </section>
    </>
  );
}
