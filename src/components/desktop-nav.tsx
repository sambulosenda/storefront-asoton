"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import type { MenuRow } from "@/lib/catalog";

/**
 * The desktop nav row: the store's main menu, each department opening a full-width panel of its
 * headings and links on hover or focus. The page you're on is underlined.
 */
export function DesktopNav({ rows }: { rows: MenuRow[] }) {
  // Its own boundary, as the path is only known at request time.
  return (
    <Suspense fallback={<NavRow rows={rows} pathname={null} />}>
      <CurrentNavRow rows={rows} />
    </Suspense>
  );
}

function CurrentNavRow({ rows }: { rows: MenuRow[] }) {
  return <NavRow rows={rows} pathname={usePathname()} />;
}

function NavRow({ rows, pathname }: { rows: MenuRow[]; pathname: string | null }) {
  // The open panel remembers the page it opened on, so a new page closes it.
  const [open, setOpen] = useState<{ label: string; path: string } | null>(null);
  const openLabel = open?.path === (pathname ?? "") ? open.label : null;
  const setOpenLabel = (label: string | null) => setOpen(label ? { label, path: pathname ?? "" } : null);
  const openRow = rows.find((r) => r.label === openLabel && "sections" in r);

  return (
    <nav
      aria-label="Primary"
      className="relative hidden border-t border-line nav:block"
      onMouseLeave={() => setOpenLabel(null)}
      onKeyDown={(e) => e.key === "Escape" && setOpenLabel(null)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpenLabel(null)}
    >
      <ul className="page-x flex flex-wrap justify-center gap-x-6 text-[12px] tracking-[0.08em] uppercase min-[90rem]:gap-x-8 min-[90rem]:text-[13px] min-[90rem]:tracking-[0.1em]">
        {rows.map((row) => {
          const href = row.href;
          const isCurrent = href !== null && pathname === href;
          const hasPanel = "sections" in row;
          const label = row.label;
          return (
            <li key={label} onMouseEnter={() => setOpenLabel(hasPanel ? label : null)}>
              {href ? (
                <Link
                  href={href}
                  aria-current={isCurrent ? "page" : undefined}
                  aria-expanded={hasPanel ? openLabel === label : undefined}
                  onFocus={() => setOpenLabel(hasPanel ? label : null)}
                  className={`block py-3.5 ${isCurrent || openLabel === label ? "underline underline-offset-8" : "no-underline"}`}
                >
                  {label}
                </Link>
              ) : (
                <button
                  type="button"
                  aria-expanded={openLabel === label}
                  onClick={() => setOpenLabel(openLabel === label ? null : label)}
                  className={`block py-3.5 uppercase ${openLabel === label ? "underline underline-offset-8" : ""}`}
                >
                  {label}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {openRow && "sections" in openRow && (
        <div className="absolute inset-x-0 top-full z-30 border-y border-line bg-paper shadow-[0_12px_24px_-16px_rgb(0_0_0/0.25)]">
          <div className="page-x grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-x-10 gap-y-6 py-8">
            {openRow.sections.map((section, i) => (
              <div key={section.label ?? i}>
                <h3 className="mb-2 text-[11px] tracking-[0.14em] text-ink-2 uppercase">{section.label ?? openRow.label}</h3>
                <ul>
                  {section.links.map((link) => (
                    <li key={link.href + link.title}>
                      <Link href={link.href} onClick={() => setOpenLabel(null)} className="flex min-h-9 items-center text-[14px] no-underline hover:underline">
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {openRow.href && (
            <div className="page-x border-t border-line py-3">
              <Link href={openRow.href} onClick={() => setOpenLabel(null)} className="text-[13px] underline underline-offset-4">
                Shop all {openRow.label.toLowerCase()}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
