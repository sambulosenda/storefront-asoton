"use client";

import Link from "next/link";
import { useState } from "react";
import { MarketButton, MarketLabel } from "@/components/market-selector";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { useStore } from "@/components/store-provider";
import { footerNav, site } from "@/lib/site";

const year = 2026;

export function openCookieSettings() {
  window.dispatchEvent(new Event("open-cookie-settings"));
}

function FooterLink({ href, label, className }: { href: string; label: string; className: string }) {
  const { openSizeGuide } = useStore();
  if (href === "/help#size-guide") {
    return (
      <button type="button" onClick={() => openSizeGuide()} className={`${className} cursor-pointer text-left`}>
        {label}
      </button>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap ${className}`}>
      <Link href="/policies/terms-of-service" className="text-night-text no-underline">
        Terms
      </Link>
      <Link href="/policies/privacy-policy" className="text-night-text no-underline">
        Privacy
      </Link>
      <button type="button" onClick={openCookieSettings} className="cursor-pointer text-night-text">
        Cookie settings
      </button>
      <Link href="/help" className="text-night-text no-underline">
        Accessibility
      </Link>
    </div>
  );
}

/** The full footer: brand, three link columns, legal row. Columns fold into an accordion on phones. */
export function Footer() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <footer className="bg-ink text-paper">
      {/* Phones */}
      <div className="flex flex-col gap-8 px-4 pt-12 pb-10 md:hidden">
        <div className="flex flex-col gap-2.5">
          <span className="font-display text-[24px] font-medium tracking-[0.01em]">{site.brand}</span>
          <p className="text-[14px] text-night-text">{site.tagline}</p>
        </div>
        <div className="border-t border-night-line">
          {footerNav.map((group) => {
            const isOpen = open === group.title;
            return (
              <div key={group.title} className="border-b border-night-line">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : group.title)}
                  className="label-caps flex min-h-14 w-full items-center justify-between text-paper"
                >
                  {group.title}
                  {isOpen ? <MinusIcon /> : <PlusIcon />}
                </button>
                {isOpen && (
                  <ul className="flex flex-col pb-4 text-[14px]">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <FooterLink href={link.href} label={link.label} className="inline-block py-2 text-paper no-underline" />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
        <MarketButton className="min-h-11 self-start text-[13px]" />
        <div className="flex flex-col gap-3 text-[12px] text-night-text">
          <LegalLinks className="gap-x-5 gap-y-2" />
          <span>
            © {year} {site.brand}
          </span>
        </div>
      </div>

      {/* Tablet and desktop */}
      <div className="page-x hidden flex-col gap-20 pt-20 pb-10 md:flex">
        <div className="flex flex-wrap justify-between gap-12">
          <div className="flex max-w-[340px] flex-[1_1_260px] flex-col gap-4">
            <span className="font-display text-[26px] font-medium tracking-[0.01em]">{site.brand}</span>
            <p className="text-[14px] leading-[1.6] text-night-text">{site.tagline}</p>
          </div>
          <div className="grid flex-[2_1_520px] grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] gap-10">
            {footerNav.map((group) => (
              <nav key={group.title} aria-label={group.title} className="flex flex-col gap-4">
                <h3 className="label-caps text-night-text">{group.title}</h3>
                <ul className="flex flex-col gap-1 text-[14px]">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <FooterLink href={link.href} label={link.label} className="inline-block py-1.5 text-paper no-underline" />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-night-line pt-6 text-[12px] text-night-text">
          <span>
            © {year} {site.brand}
          </span>
          <LegalLinks className="gap-x-6 gap-y-2" />
          <MarketButton className="text-night-text" />
        </div>
      </div>
    </footer>
  );
}

/** A single-row footer for editorial pages (Lookbook, Help). */
export function CompactFooter() {
  return (
    <footer className="bg-ink text-night-text">
      <div className="page-x flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-10 text-[12px]">
        <span className="font-display text-[24px] font-medium tracking-[0.01em] text-paper">{site.brand}</span>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/story" className="text-night-text no-underline">
            Our story
          </Link>
          <Link href="/help" className="text-night-text no-underline">
            Help
          </Link>
          <button type="button" onClick={openCookieSettings} className="cursor-pointer text-night-text">
            Cookie settings
          </button>
        </div>
        <span>
          © {year} {site.brand} · <MarketLabel />
        </span>
      </div>
    </footer>
  );
}

/** The 404 page's one-line footer. */
export function MinimalFooter() {
  return (
    <footer className="bg-ink text-night-text">
      <div className="page-x flex flex-wrap justify-between gap-x-8 gap-y-3 py-6 text-[12px]">
        <span>
          © {year} {site.brand}
        </span>
        <span>
          <MarketLabel />
        </span>
      </div>
    </footer>
  );
}
