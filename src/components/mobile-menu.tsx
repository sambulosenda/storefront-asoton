"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MarketButton } from "@/components/market-selector";
import { BagIcon, CloseIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { Sheet } from "@/components/sheet";
import { useStore } from "@/components/store-provider";
import type { Image as ShopifyImage, MenuLink } from "@/lib/shopify/types";
import { site } from "@/lib/site";

export type MenuGroup = { label: string; links: MenuLink[] };
export type MenuPromo = { label: string; title: string; href: string; image: ShopifyImage | null };

/** The full-screen menu on phones, and a left drawer on tablets where the nav doesn't fit. */
export function MobileMenu({
  groups,
  accountUrl,
  promo,
}: {
  groups: MenuGroup[];
  accountUrl: string | null;
  promo: MenuPromo | null;
}) {
  const { overlay, close, open, cart } = useStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const count = cart?.totalQuantity ?? 0;
  const big = "flex min-h-[60px] items-center border-b border-line font-display text-[28px] no-underline";

  return (
    <Sheet open={overlay === "menu"} onClose={close} placement="full" className="md:w-[420px]" aria-label="Menu">
      <div className="flex h-full flex-col">
        <div className="grid h-[61px] flex-none grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center border-b border-line px-2">
          <button type="button" aria-label="Close menu" onClick={close} className="inline-flex size-11 items-center justify-center">
            <CloseIcon />
          </button>
          <Link href="/" onClick={close} className="font-display text-[22px] font-medium tracking-[0.01em] whitespace-nowrap no-underline">
            {site.brand}
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

        <nav aria-label="Main" className="min-h-0 flex-auto overflow-y-auto px-4 pt-2 pb-6" onClick={(e) => (e.target as HTMLElement).closest("a") && close()}>
          <Link href="/collections/new-in" className={big}>
            New in
          </Link>
          {groups.map((group) => {
            const isOpen = expanded === group.label;
            return (
              <div key={group.label} className="border-b border-line">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : group.label)}
                  className="flex min-h-[60px] w-full items-center justify-between text-left font-display text-[28px]"
                >
                  {group.label}
                  {isOpen ? <MinusIcon /> : <PlusIcon />}
                </button>
                {isOpen && (
                  <ul className="pb-4">
                    {group.links.map((link) => (
                      <li key={link.href + link.title}>
                        <Link href={link.href} className="flex min-h-11 items-center no-underline">
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          <Link href="/collections/accessories" className={big}>
            Accessories
          </Link>

          <ul className="flex flex-col py-5 text-[15px]">
            <li>
              <Link href="/lookbook" className="flex min-h-11 items-center no-underline">
                Lookbook
              </Link>
            </li>
            <li>
              <Link href="/story" className="flex min-h-11 items-center no-underline">
                Our story
              </Link>
            </li>
            <li>
              <Link href="/help" className="flex min-h-11 items-center no-underline">
                Help
              </Link>
            </li>
            {accountUrl && (
              <li>
                <a href={accountUrl} className="flex min-h-11 items-center no-underline">
                  Sign in
                </a>
              </li>
            )}
          </ul>

          {promo && (
            <Link
              href={promo.href}
              onClick={close}
              className={`grid items-center gap-4 bg-stone p-3 no-underline ${promo.image ? "grid-cols-[96px_minmax(0,1fr)]" : ""}`}
            >
              {promo.image && (
                <span className="relative h-[120px] overflow-hidden bg-paper">
                  <Image src={promo.image.url} alt="" fill sizes="96px" className="object-cover" />
                </span>
              )}
              <span className="flex flex-col gap-1">
                <span className="text-[11px] tracking-[0.14em] text-ink-2 uppercase">{promo.label}</span>
                <span className="font-display text-[22px] leading-[1.1]">{promo.title}</span>
                <span className="text-[13px] underline underline-offset-4">Shop now</span>
              </span>
            </Link>
          )}
        </nav>

        <div className="flex-none border-t border-line px-4 pt-2 pb-6">
          <MarketButton className="min-h-11 text-[14px]" />
        </div>
      </div>
    </Sheet>
  );
}
