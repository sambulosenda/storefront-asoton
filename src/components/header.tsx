"use client";

import Link from "next/link";
import { DesktopNav } from "@/components/desktop-nav";
import { AccountIcon, BagIcon, MenuIcon, SearchIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { MarketButton } from "@/components/market-selector";
import { useStore } from "@/components/store-provider";
import type { MenuPromo, MenuRow } from "@/lib/catalog";
import { menuRows } from "@/lib/site";

export function AnnouncementBar({ threshold }: { threshold: string }) {
  return (
    <div className="bg-ink text-paper">
      {/* Phones: one short centred line. */}
      <div className="flex min-h-9 items-center justify-center px-4 text-[11px] tracking-[0.06em] md:hidden">
        Free UK delivery over {threshold}
      </div>
      <div className="page-x hidden min-h-10 flex-wrap items-center justify-between gap-x-6 text-[12px] tracking-[0.06em] md:flex">
        <span className="py-2.5">Free UK delivery on orders over {threshold}</span>
        <MarketButton className="min-h-10 text-[12px] tracking-[0.06em] text-paper" />
      </div>
    </div>
  );
}

export function Header({
  accountUrl,
  menu = [],
  promo = null,
  minimal = false,
}: {
  accountUrl: string | null;
  menu?: MenuRow[];
  promo?: MenuPromo | null;
  minimal?: boolean;
}) {
  const { cart, open } = useStore();
  const count = cart?.totalQuantity ?? 0;

  return (
    <header className="border-b border-line bg-paper">
      {/* Phones */}
      <div className="grid h-[61px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-2 md:hidden">
        <div className="flex items-center">
          <button type="button" aria-label="Open menu" onClick={() => open("menu")} className="inline-flex size-11 items-center justify-center">
            <MenuIcon />
          </button>
          <button type="button" aria-label="Search" onClick={() => open("search")} className="inline-flex size-11 items-center justify-center">
            <SearchIcon />
          </button>
        </div>
        <Link href="/" className="block no-underline">
          <Logo tagline={false} className="h-[26px] w-auto" />
        </Link>
        <div className="flex justify-end">
          <button
            type="button"
            aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}
            onClick={() => open("cart")}
            className="relative inline-flex size-11 items-center justify-center"
          >
            <BagIcon />
            <span aria-hidden="true" className="absolute inset-x-0 top-[18px] text-center text-[10px] font-semibold">
              {count}
            </span>
          </button>
        </div>
      </div>

      {/* Tablet and desktop */}
      <div className="page-x hidden h-[84px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-6 md:grid">
        <div>
          <button type="button" aria-label="Open menu" onClick={() => open("menu")} className="inline-flex size-11 items-center justify-start nav:hidden">
            <MenuIcon />
          </button>
        </div>
        <Link href="/" className="block no-underline">
          <Logo className="h-10 w-auto xl:h-[46px]" />
        </Link>
        <div className="flex items-center justify-end gap-1">
          <button type="button" aria-label="Search" onClick={() => open("search")} className="inline-flex size-11 items-center justify-center hover:text-indigo">
            <SearchIcon />
          </button>
          {!minimal && (
            <a href={accountUrl ?? "#"} aria-label="Account" className="inline-flex size-11 items-center justify-center">
              <AccountIcon />
            </a>
          )}
          <button
            type="button"
            onClick={() => open("cart")}
            className="py-3 pl-3 text-[13px] tracking-[0.1em] whitespace-nowrap uppercase hover:text-indigo"
          >
            Bag ({count})
          </button>
        </div>
      </div>
      <DesktopNav rows={menuRows(menu)} promo={promo} />
    </header>
  );
}
