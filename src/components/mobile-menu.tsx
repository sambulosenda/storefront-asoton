"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MarketButton } from "@/components/market-selector";
import { AccountIcon, ArrowLeft, BagIcon, ChevronDown, CloseIcon, SearchIcon } from "@/components/icons";
import { Sheet } from "@/components/sheet";
import { useStore } from "@/components/store-provider";
import type { MenuGroup, MenuPromo, MenuRow, MenuSection } from "@/lib/catalog";
import type { Image as ShopifyImage } from "@/lib/shopify/types";
import { site } from "@/lib/site";

/** The full-screen menu on phones, and a left drawer on tablets where the nav doesn't fit. */
export function MobileMenu({
  rows,
  accountUrl,
  promo,
}: {
  rows: MenuRow[];
  accountUrl: string | null;
  promo: MenuPromo | null;
}) {
  const { overlay, close, open, cart } = useStore();
  // Where you've drilled to: a department, then one of its headings.
  const [trail, setTrail] = useState<{ dept: string; section: string | null } | null>(null);
  const dept = trail ? rows.find((r): r is MenuGroup => r.label === trail.dept && "sections" in r) : undefined;
  const section = dept && trail?.section ? dept.sections.find((s) => s.label === trail.section) : undefined;
  // Drilling in or back moves focus to the new screen, so keyboard and screen reader users follow it.
  const navRef = useRef<HTMLElement>(null);
  const moved = useRef(false);
  useEffect(() => {
    if (!moved.current) return;
    const nav = navRef.current;
    (nav?.querySelector<HTMLElement>("[data-level-focus]") ?? nav?.querySelector<HTMLElement>("a, button"))?.focus();
    nav?.scrollTo({ top: 0 });
  }, [trail]);
  const go = (next: typeof trail) => {
    moved.current = true;
    setTrail(next);
  };
  const count = cart?.totalQuantity ?? 0;
  const row = "flex min-h-16 w-full items-center gap-3 border-b border-line text-left font-display text-[22px] no-underline";
  const drill = "flex min-h-14 w-full items-center justify-between border-b border-line text-left text-[17px]";

  return (
    <Sheet open={overlay === "menu"} onClose={() => (setTrail(null), close())} placement="full" className="md:w-[420px]" aria-label="Menu">
      <div className="flex h-full flex-col">
        <div className="grid h-[61px] flex-none grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center border-b border-line px-2">
          <button type="button" aria-label="Close menu" onClick={() => (setTrail(null), close())} className="inline-flex size-11 items-center justify-center">
            <CloseIcon />
          </button>
          <Link href="/" onClick={close} className="font-display text-[22px] font-medium tracking-[0.01em] whitespace-nowrap no-underline">
            {site.name}
          </Link>
          <div className="flex justify-end">
            <button
              type="button"
              aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}
              onClick={() => open("cart")}
              className="relative inline-flex size-11 items-center justify-center"
            >
              <BagIcon size={21} />
              <span aria-hidden="true" className="absolute inset-x-0 top-[18px] text-center text-[10px] font-semibold">
                {count}
              </span>
            </button>
          </div>
        </div>

        <nav
          ref={navRef}
          aria-label="Main"
          className="min-h-0 flex-auto overflow-y-auto px-4 pt-2 pb-6"
          onClick={(e) => (e.target as HTMLElement).closest("a") && (setTrail(null), close())}
        >
          {section && dept ? (
            <Level back={dept.label} onBack={() => go({ dept: dept.label, section: null })} title={section.label ?? dept.label} shopAll={section.href}>
              <Links section={section} />
            </Level>
          ) : dept ? (
            <Level back="Menu" onBack={() => go(null)} title={dept.label} shopAll={dept.href}>
              {dept.featured.map((link) => (
                <Link key={link.href} href={link.href} className="flex min-h-14 items-center border-b border-line text-[17px] no-underline">
                  {link.title}
                </Link>
              ))}
              {dept.sections.map((s, i) =>
                s.label ? (
                  <button key={s.label} type="button" onClick={() => go({ dept: dept.label, section: s.label })} className={drill}>
                    {s.label}
                    <ChevronDown className="-rotate-90" />
                  </button>
                ) : (
                  <Links key={i} section={s} />
                ),
              )}
            </Level>
          ) : (
            <>
              {/* Search and your account come first, as on a department store's app. */}
              <div className="flex items-center gap-2 pt-2 pb-3">
                <button
                  type="button"
                  onClick={() => (setTrail(null), open("search"))}
                  className="flex h-12 min-w-0 flex-auto items-center gap-3 border border-line px-3 text-left text-[15px] text-ink-2"
                >
                  <SearchIcon size={18} />
                  <span className="truncate">Search dresses, kente, gifts…</span>
                </button>
                {accountUrl && (
                  <a href={accountUrl} aria-label="Sign in" className="inline-flex size-12 flex-none items-center justify-center border border-line">
                    <AccountIcon />
                  </a>
                )}
              </div>
              {rows.map((r, i) => {
                // New in shows the menu's promo piece; departments show their own.
                const image = "sections" in r ? r.image : i === 0 ? (promo?.image ?? null) : null;
                const body = (
                  <>
                    <span className="flex-auto">{r.label}</span>
                    {image && <Thumb image={image} />}
                    {"sections" in r && <ChevronDown className="flex-none -rotate-90" />}
                  </>
                );
                return "sections" in r ? (
                  <button key={r.label} type="button" onClick={() => go({ dept: r.label, section: null })} className={row}>
                    {body}
                  </button>
                ) : (
                  <Link key={r.href} href={r.href} className={row}>
                    {body}
                  </Link>
                );
              })}
              <ul className="flex flex-col py-5 text-[15px]">
                {[
                  ["Lookbook", "/lookbook"],
                  ["Our story", "/story"],
                  ["Help", "/help"],
                  ["FAQs", "/faqs"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="flex min-h-11 items-center no-underline">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>

        <div className="flex-none border-t border-line px-4 pt-2 pb-6">
          <MarketButton className="min-h-11 text-[14px]" />
        </div>
      </div>
    </Sheet>
  );
}

/** A drilled-in screen: a way back, the screen's name, "Shop all" first, then its rows. */
function Level({ back, onBack, title, shopAll, children }: { back: string; onBack: () => void; title: string; shopAll: string | null; children: React.ReactNode }) {
  return (
    <div>
      <button type="button" onClick={onBack} className="-ml-1 flex min-h-11 items-center gap-2 text-[14px] text-ink-2">
        <ArrowLeft size={18} />
        {back}
      </button>
      <h2 tabIndex={-1} data-level-focus className="border-b border-line outline-none pt-2 pb-4 font-display text-[32px] leading-none">{title}</h2>
      {shopAll && (
        <Link href={shopAll} className="flex min-h-14 items-center border-b border-line text-[17px] font-semibold no-underline">
          Shop all {title.toLowerCase()}
        </Link>
      )}
      {children}
    </div>
  );
}

function Links({ section }: { section: MenuSection }) {
  return (
    <ul>
      {section.links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className="flex min-h-14 items-center border-b border-line text-[17px] no-underline">
            {link.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Thumb({ image }: { image: ShopifyImage }) {
  return (
    <span className="relative h-12 w-10 flex-none overflow-hidden bg-stone">
      <Image src={image.url} alt="" fill sizes="40px" className="object-cover" />
    </span>
  );
}
