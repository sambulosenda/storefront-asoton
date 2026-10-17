"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { AccountIcon, BagIcon, MenuIcon, SearchIcon } from "@/components/icons";
import { MarketButton } from "@/components/market-selector";
import { useStore } from "@/components/store-provider";
import { nav, site } from "@/lib/site";

export function AnnouncementBar({ threshold }: { threshold: string }) {
  return (
    <div className="bg-ink text-paper">
      {/* Phones: one short centred line. */}
      <div className="flex min-h-9 items-center justify-center px-4 text-[11px] tracking-[0.06em] md:hidden">
        Complimentary UK delivery over {threshold}
      </div>
      <div className="page-x hidden min-h-10 flex-wrap items-center justify-between gap-x-6 text-[12px] tracking-[0.06em] md:flex">
        <span className="py-2.5">Complimentary UK delivery on orders over {threshold}</span>
        <MarketButton className="min-h-10 text-[12px] tracking-[0.06em] text-paper" />
      </div>
    </div>
  );
}

export function Header({ accountUrl, minimal = false }: { accountUrl: string | null; minimal?: boolean }) {
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
        <Link href="/" className="font-display text-[22px] font-medium tracking-[0.01em] whitespace-nowrap no-underline">
          {site.brand}
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
        <Suspense fallback={<NavLinks current={null} />}>
          <PrimaryNav />
        </Suspense>
        <button type="button" aria-label="Open menu" onClick={() => open("menu")} className="inline-flex size-11 items-center justify-start nav:hidden">
          <MenuIcon />
        </button>
        <Link href="/" className="font-display text-[28px] font-medium tracking-[0.01em] whitespace-nowrap no-underline">
          {site.brand}
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
    </header>
  );
}

/** The page you're on is underlined. Its own boundary, as the path is only known at request time. */
function PrimaryNav() {
  return <NavLinks current={usePathname()} />;
}

function NavLinks({ current }: { current: string | null }) {
  return (
    <nav aria-label="Primary" className="hidden gap-7 text-[13px] tracking-[0.1em] uppercase nav:flex">
      {nav.map((item) => {
        const isCurrent = current === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isCurrent ? "page" : undefined}
            className={`py-3 ${isCurrent ? "underline underline-offset-8" : "no-underline"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
