"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

  // Wider screens: the header slides away on the way down a page, where it would only take room
  // from what the shopper is looking at, and comes back the moment they scroll up.
  const ref = useRef<HTMLElement>(null);
  const [away, setAway] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const wide = window.matchMedia("(min-width: 48rem)");
    const root = document.documentElement;
    let last = window.scrollY;
    let frame = 0;
    let now: boolean | null = null;
    const set = (next: boolean) => {
      if (next === now) return;
      now = next;
      setAway(next);
      // What sticks below the header (a collection's toolbar, the help topics) follows it: its
      // height while it shows, nothing while it's away. Phones keep the fixed height in globals.css.
      if (wide.matches) root.style.setProperty("--header-h", next ? "0px" : `${el.getBoundingClientRect().height}px`);
      else root.style.removeProperty("--header-h");
    };
    const check = () => {
      frame = 0;
      const y = window.scrollY;
      // Near the top the header is in its own place on the page, under the announcement bar.
      const home = (el.previousElementSibling as HTMLElement | null)?.offsetHeight ?? 0;
      if (!wide.matches || y <= home + el.offsetHeight || el.contains(document.activeElement)) set(false);
      else if (y > last + 6) set(true);
      else if (y < last - 6) set(false);
      last = y;
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(check);
    };
    const show = () => set(false);
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Crossing between the phone and wide layouts: work the height out afresh.
    const relayout = () => {
      now = null;
      check();
    };
    wide.addEventListener("change", relayout);
    // Keyboard users tabbing into the header get it back whichever way they last scrolled.
    el.addEventListener("focusin", show);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      wide.removeEventListener("change", relayout);
      el.removeEventListener("focusin", show);
      root.style.removeProperty("--header-h");
    };
  }, []);

  return (
    // The header stays at the top of the screen, so the menu, search and bag are always in reach:
    // always on phones, and on wider screens whenever the shopper scrolls up.
    <header
      ref={ref}
      className={`sticky top-0 z-30 border-b border-line bg-paper md:transition-transform md:duration-(--duration-quick) md:ease-(--ease-out-soft) ${away ? "md:-translate-y-full" : ""}`}
    >
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
