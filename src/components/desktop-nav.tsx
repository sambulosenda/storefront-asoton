"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import type { MenuGroup, MenuPromo, MenuRow } from "@/lib/catalog";
import type { Image as ShopifyImage } from "@/lib/shopify/types";

// Hover intent: a pointer passing over the row on its way down the page doesn't open a panel, and
// one crossing a gap between the row and the panel doesn't close it.
const OPEN_DELAY = 120;
const CLOSE_DELAY = 150;

/**
 * The desktop nav row: the store's main menu. A department opens a full-width panel on hover or
 * focus: "Shop all" first, its headings in columns, and pictures of the department and New in.
 */
export function DesktopNav({ rows, promo }: { rows: MenuRow[]; promo: MenuPromo | null }) {
  // Its own boundary, as the path is only known at request time.
  return (
    <Suspense fallback={<NavRow rows={rows} promo={promo} pathname={null} />}>
      <CurrentNavRow rows={rows} promo={promo} />
    </Suspense>
  );
}

function CurrentNavRow(props: { rows: MenuRow[]; promo: MenuPromo | null }) {
  return <NavRow {...props} pathname={usePathname()} />;
}

function NavRow({ rows, promo, pathname }: { rows: MenuRow[]; promo: MenuPromo | null; pathname: string | null }) {
  // The open panel remembers the page it opened on, so a new page closes it.
  const [open, setOpen] = useState<{ label: string; path: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const path = pathname ?? "";
  const openLabel = open?.path === path ? open.label : null;
  const openRow = rows.find((r): r is MenuGroup => r.label === openLabel && "sections" in r);
  // Escape closes an open panel wherever focus is, including after opening it by hover.
  useEffect(() => {
    if (!openLabel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openLabel]);

  const show = (label: string | null) => {
    clearTimeout(timer.current);
    setOpen(label ? { label, path } : null);
  };
  const later = (label: string | null, delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(label ? { label, path } : null), delay);
  };

  return (
    <nav
      aria-label="Primary"
      className="relative hidden border-t border-line nav:block"
      onMouseLeave={() => later(null, CLOSE_DELAY)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && show(null)}
    >
      <ul className="page-x flex flex-wrap justify-center gap-x-6 text-[12px] tracking-[0.08em] uppercase min-[90rem]:gap-x-8 min-[90rem]:text-[13px] min-[90rem]:tracking-[0.1em]">
        {rows.map((row) => {
          const hasPanel = "sections" in row;
          const isOpen = openLabel === row.label;
          const isCurrent = row.href !== null && pathname === row.href;
          const className = `block py-3.5 uppercase ${isCurrent || isOpen ? "underline underline-offset-8" : "no-underline"}`;
          return (
            <li key={row.label} onMouseEnter={() => (hasPanel ? later(row.label, openLabel ? 0 : OPEN_DELAY) : later(null, 0))}>
              {row.href ? (
                <Link
                  href={row.href}
                  aria-current={isCurrent ? "page" : undefined}
                  aria-expanded={hasPanel ? isOpen : undefined}
                  onFocus={() => show(hasPanel ? row.label : null)}
                  className={className}
                >
                  {row.label}
                </Link>
              ) : (
                <button type="button" aria-expanded={isOpen} onClick={() => show(isOpen ? null : row.label)} className={className}>
                  {row.label}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {openRow && (
        <div
          onMouseEnter={() => clearTimeout(timer.current)}
          className="absolute inset-x-0 top-full z-30 border-y border-line bg-paper shadow-[0_16px_32px_-20px_rgb(0_0_0/0.3)]"
        >
          <div className="page-x grid grid-cols-[minmax(0,1fr)_auto] gap-12 py-8">
            <div>
              {openRow.href && (
                <Link href={openRow.href} onClick={() => show(null)} className="mb-6 inline-block font-display text-[24px] leading-none no-underline hover:underline">
                  Shop all {openRow.label.toLowerCase()} <span aria-hidden="true">→</span>
                </Link>
              )}
              <div className="columns-[180px] gap-10">
                {openRow.featured.length > 0 && (
                  <div className="mb-6 break-inside-avoid">
                    <h3 className="mb-2 text-[11px] font-semibold tracking-[0.14em] uppercase">Featured</h3>
                    <ul>
                      {openRow.featured.map((link) => (
                        <li key={link.href}>
                          <Link href={link.href} onClick={() => show(null)} className="flex min-h-8 items-center text-[14px] font-medium no-underline hover:underline">
                            {link.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {openRow.sections.map((section, i) => (
                  <div key={section.label ?? i} className="mb-6 break-inside-avoid">
                    <h3 className="mb-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
                      {section.href ? (
                        <Link href={section.href} onClick={() => show(null)} className="no-underline hover:underline">
                          {section.label}
                        </Link>
                      ) : (
                        (section.label ?? openRow.label)
                      )}
                    </h3>
                    <ul>
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <Link href={link.href} onClick={() => show(null)} className="flex min-h-8 items-center text-[14px] text-ink-2 no-underline hover:text-ink hover:underline">
                            {link.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden gap-4 min-[72rem]:flex">
              {openRow.image && openRow.href && (
                <Tile href={openRow.href} image={openRow.image} label={openRow.label} title={`Shop all ${openRow.label.toLowerCase()}`} onClick={() => show(null)} />
              )}
              {/* New in sits beside the department only when it shows a different piece. */}
              {promo?.image && promo.image.url !== openRow.image?.url && <Tile href={promo.href} image={promo.image} label={promo.label} title={promo.title} onClick={() => show(null)} />}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function Tile({ href, image, label, title, onClick }: { href: string; image: ShopifyImage; label: string; title: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="group flex w-[200px] flex-col gap-2 no-underline">
      <span className="relative aspect-[4/5] overflow-hidden bg-stone">
        <Image src={image.url} alt="" fill sizes="200px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />
      </span>
      <span className="text-[11px] tracking-[0.14em] text-ink-2 uppercase">{label}</span>
      <span className="line-clamp-2 font-display text-[18px] leading-[1.15] group-hover:underline">{title}</span>
    </Link>
  );
}
