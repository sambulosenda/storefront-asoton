"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { FilterChip, FilterDrawer } from "@/components/filter-drawer";
import { ChevronDown, FilterIcon, FourUpIcon, TwoUpIcon } from "@/components/icons";
import { ProductGrid } from "@/components/product-card";
import { GridSkeleton } from "@/components/skeletons";
import { loadMoreAction } from "@/lib/actions";
import { chipLabel, SORTS } from "@/lib/filters";
import type { Filter, PageInfo, Product, SortKey } from "@/lib/shopify/types";

export type Category = { title: string; href: string; current: boolean };

/** How many products sit above the editorial block. */
const FIRST_ROWS = 8;

export function CollectionBrowser({
  products,
  pageInfo,
  filters,
  selected,
  sort,
  categories,
  categoriesLabel,
  editorial,
  handle,
  query,
}: {
  products: Product[];
  pageInfo: PageInfo;
  filters: Filter[];
  selected: string[];
  sort: SortKey;
  categories: Category[];
  categoriesLabel: string;
  editorial?: ReactNode;
  handle?: string;
  query?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navigating, startNavigation] = useTransition();
  const [wide, setWide] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [more, setMore] = useState<{ products: Product[]; pageInfo: PageInfo }>({ products: [], pageInfo });
  const [loadingMore, startLoadingMore] = useTransition();
  const [moreError, setMoreError] = useState(false);

  const navigate = (next: { sort?: SortKey; filters?: string[] }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.sort !== undefined) {
      if (next.sort === "featured") params.delete("sort");
      else params.set("sort", next.sort);
    }
    if (next.filters !== undefined) {
      params.delete("filter");
      next.filters.forEach((f) => params.append("filter", f));
    }
    const qs = params.toString();
    startNavigation(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const loadMore = () => {
    if (!more.pageInfo.endCursor) return;
    setMoreError(false);
    startLoadingMore(async () => {
      try {
        const page = await loadMoreAction({ handle, query, sort, filters: selected, after: more.pageInfo.endCursor! });
        setMore((m) => ({
          products: [...m.products, ...page.products],
          pageInfo: { hasNextPage: page.hasNextPage, endCursor: page.endCursor },
        }));
      } catch {
        setMoreError(true);
      }
    });
  };

  const chips = selected.flatMap((input) => {
    const label = chipLabel(input, filters);
    return label ? [{ input, label }] : [];
  });
  const removeFilter = (input: string) => navigate({ filters: selected.filter((f) => f !== input) });

  const first = products.slice(0, FIRST_ROWS);
  const rest = [...products.slice(FIRST_ROWS), ...more.products];
  const hasFilters = filters.length > 0;

  return (
    <>
      {/* Category chips (phones) */}
      {categories.length > 1 && (
        <nav aria-label={categoriesLabel} className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-4 md:hidden">
          {categories.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              aria-current={c.current ? "page" : undefined}
              className={`inline-flex h-11 flex-none items-center px-4 text-[14px] no-underline ${
                c.current ? "bg-ink text-paper hover:text-paper" : "border border-line"
              }`}
            >
              {c.title}
            </Link>
          ))}
        </nav>
      )}

      {/* Toolbar */}
      <div className="sticky top-0 z-20 bg-paper">
        {/* Phones */}
        <div className={`grid border-y border-line md:hidden ${hasFilters ? "grid-cols-2" : "grid-cols-1"}`}>
          {hasFilters && (
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="flex h-[52px] cursor-pointer items-center justify-center gap-2 border-r border-line text-[14px]"
            >
              <FilterIcon size={18} />
              Filter{selected.length > 0 && ` (${selected.length})`}
            </button>
          )}
          <SortMenu sort={sort} onChange={(s) => navigate({ sort: s })} className="h-[52px] justify-center" />
        </div>
        {/* Tablet and desktop */}
        <div className="page-x hidden md:block">
          <div className="flex flex-wrap items-center justify-between gap-x-8 border-y border-line">
            {/* Nudged down 1px so the current tab's underline sits on the toolbar's bottom rule. */}
            <nav aria-label={categoriesLabel} className="no-scrollbar relative top-px flex max-w-full gap-7 overflow-x-auto text-[14px]">
              {categories.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  aria-current={c.current ? "page" : undefined}
                  className={`flex-none border-b pt-[17px] pb-4 no-underline ${
                    c.current ? "border-ink font-medium" : "border-transparent text-ink-2"
                  }`}
                >
                  {c.title}
                </Link>
              ))}
            </nav>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 py-1.5">
              {hasFilters && (
                <button type="button" onClick={() => setFilterOpen(true)} className="inline-flex h-11 cursor-pointer items-center gap-2 px-1 text-[14px]">
                  <FilterIcon size={18} />
                  Filter{selected.length > 0 && ` (${selected.length})`}
                </button>
              )}
              <SortMenu sort={sort} onChange={(s) => navigate({ sort: s })} className="h-11 px-1" />
              <div role="group" aria-label="Products per row" className="flex gap-1">
                <button
                  type="button"
                  aria-label="Four per row"
                  aria-pressed={!wide}
                  onClick={() => setWide(false)}
                  className={`inline-flex size-11 cursor-pointer items-center justify-center border ${!wide ? "border-ink" : "border-transparent text-ink-2"}`}
                >
                  <FourUpIcon size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Two per row"
                  aria-pressed={wide}
                  onClick={() => setWide(true)}
                  className={`inline-flex size-11 cursor-pointer items-center justify-center border ${wide ? "border-ink" : "border-transparent text-ink-2"}`}
                >
                  <TwoUpIcon size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {chips.length > 0 && products.length > 0 && (
        <div aria-label="Selected filters" className="page-x flex flex-wrap items-center gap-2 pt-4 md:pt-6">
          {chips.map((chip) => (
            <FilterChip key={chip.input} label={chip.label} onRemove={() => removeFilter(chip.input)} />
          ))}
          <button type="button" onClick={() => navigate({ filters: [] })} className="h-9 cursor-pointer px-2 text-[13px] underline underline-offset-4">
            Clear all
          </button>
        </div>
      )}

      <div aria-busy={navigating} className={navigating ? "opacity-60 transition-opacity" : ""}>
        {products.length === 0 ? (
          <div className="page-x pt-4 pb-24 md:pt-10">
            <div className="flex flex-col items-start gap-3.5 py-12">
              {selected.length > 0 ? (
                <>
                  <p className="font-display text-[30px] leading-[1.1] md:text-[36px]">Nothing matches those filters</p>
                  <p className="max-w-[420px] text-[15px] leading-[1.6] text-ink-2">Try removing a size or colour.</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {chips.map((chip) => (
                      <FilterChip key={chip.input} label={chip.label} onRemove={() => removeFilter(chip.input)} />
                    ))}
                    <button type="button" onClick={() => navigate({ filters: [] })} className="h-9 cursor-pointer px-2 text-[13px] underline underline-offset-4">
                      Clear all
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-display text-[30px] leading-[1.1] md:text-[36px]">Nothing here yet</p>
                  <p className="max-w-[420px] text-[15px] leading-[1.6] text-ink-2">New pieces are on their way. Start with the cloth instead.</p>
                  <Link href="/collections/new-in" className="btn btn-outline mt-2">
                    Shop new in
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <section aria-label="Products" className="page-x pt-4 md:pt-10">
              <ProductGrid products={first} wide={wide} />
            </section>

            {editorial}

            {rest.length > 0 && (
              <section aria-label="More products" className={`page-x ${editorial ? "" : "pt-8 md:pt-12"}`}>
                <ProductGrid products={rest} wide={wide} />
              </section>
            )}
            {loadingMore && (
              <div className="page-x pt-8 md:pt-12">
                <GridSkeleton count={4} />
              </div>
            )}

            <div className="page-x flex flex-col items-center gap-4 pt-10 pb-14 md:pt-[72px] md:pb-[120px]">
              {more.pageInfo.hasNextPage && (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn btn-outline w-full md:w-auto md:px-10"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              )}
              {moreError && (
                <p role="alert" className="text-[14px] text-error">
                  We couldn’t load more pieces. Check your connection and try again.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {hasFilters && (
        <FilterDrawer
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          filters={filters}
          selected={selected}
          onApply={(next) => navigate({ filters: next })}
        />
      )}
    </>
  );
}

function SortMenu({ sort, onChange, className = "" }: { sort: SortKey; onChange: (sort: SortKey) => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SORTS.find((s) => s.key === sort) ?? SORTS[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
        className={`flex w-full cursor-pointer items-center gap-1.5 text-[14px] ${className}`}
      >
        Sort: {current.label}
        <ChevronDown size={14} />
      </button>
      {open && (
        <ul className="absolute top-full right-0 z-30 min-w-[220px] border border-line bg-paper py-2 shadow-[0_12px_32px_-16px_rgba(20,19,16,0.35)]">
          {SORTS.map((s) => (
            <li key={s.key}>
              <button
                type="button"
                aria-current={s.key === sort ? "true" : undefined}
                onClick={() => {
                  setOpen(false);
                  if (s.key !== sort) onChange(s.key);
                }}
                className={`flex min-h-11 w-full cursor-pointer items-center px-4 text-left text-[14px] hover:bg-stone ${
                  s.key === sort ? "font-medium" : ""
                }`}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
