"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { ArrowRight, CloseIcon, SearchIcon } from "@/components/icons";
import { Sheet } from "@/components/sheet";
import { useStore } from "@/components/store-provider";
import { searchAction } from "@/lib/actions";
import type { PredictiveResults } from "@/lib/shopify/types";
import { popularSearches } from "@/lib/site";

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** The suggestion with the typed part in bold. */
function Highlight({ text, query }: { text: string; query: string }) {
  const i = norm(text).indexOf(norm(query.trim()));
  if (i < 0 || !query.trim()) return <>{text}</>;
  const end = i + query.trim().length;
  return (
    <>
      {text.slice(0, i)}
      <strong className="font-semibold">{text.slice(i, end)}</strong>
      {text.slice(end)}
    </>
  );
}

export function PopularSearches({ onPick }: { onPick: (term: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {popularSearches.map((term) => (
        <button
          key={term}
          type="button"
          onClick={() => onPick(term)}
          className="h-11 cursor-pointer border border-line px-[18px] text-[14px] hover:border-ink"
        >
          {term}
        </button>
      ))}
    </div>
  );
}

export function SearchOverlay() {
  const { overlay, close } = useStore();
  return (
    <Sheet open={overlay === "search"} onClose={close} placement="top" aria-label="Search">
      <SearchPanel onClose={close} />
    </Sheet>
  );
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ q: string; data: PredictiveResults } | null>(null);
  const q = query.trim();

  useEffect(() => {
    if (!q) return;
    let live = true;
    const timer = setTimeout(() => {
      searchAction(q).then((data) => live && setResults({ q, data }), () => {});
    }, 180);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [q]);

  const data = q && results?.q === q ? results.data : null;
  const found = data && (data.products.length > 0 || data.queries.length > 0 || data.collections.length > 0);
  const resultsHref = `/search?q=${encodeURIComponent(q)}`;

  return (
    <div className="max-h-dvh overflow-y-auto">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (!q) return;
          onClose();
          router.push(resultsHref);
        }}
        className="flex h-16 items-center gap-2 border-b border-line pr-2 pl-4 md:h-24 md:gap-4 md:px-12"
      >
        <SearchIcon size={24} className="flex-none" />
        <label htmlFor="site-search" className="sr-only">
          Search the shop
        </label>
        <input
          id="site-search"
          type="search"
          autoComplete="off"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for adire, kaftans, headwraps…"
          className="h-14 min-w-0 flex-1 bg-transparent font-display text-[22px] placeholder:text-muted focus:outline-none md:text-[32px]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="h-11 cursor-pointer px-2 text-[13px] text-ink-2 underline underline-offset-4"
          >
            Clear
          </button>
        )}
        <button type="button" aria-label="Close search" onClick={onClose} className="inline-flex size-11 flex-none items-center justify-center">
          <CloseIcon size={22} />
        </button>
      </form>

      {!q && (
        <div className="flex flex-col gap-4 px-4 pt-6 pb-8 md:px-12 md:pt-8 md:pb-12">
          <h2 className="label-caps text-ink-2">Popular searches</h2>
          <PopularSearches onPick={(term) => setQuery(term.toLowerCase())} />
        </div>
      )}

      {data && !found && (
        <div className="flex max-w-[760px] flex-col gap-4 px-4 pt-8 pb-10 md:px-12 md:pt-10 md:pb-12">
          <p className="font-display text-[28px] leading-[1.1] md:text-[36px]">No results for “{q}”</p>
          <p className="leading-[1.6] text-ink-2">Check the spelling, or search by cloth or garment instead.</p>
          <div className="pt-2">
            <PopularSearches onPick={(term) => setQuery(term.toLowerCase())} />
          </div>
        </div>
      )}

      {data && found && (
        <div className="grid gap-8 px-4 pt-6 pb-8 md:grid-cols-[300px_minmax(0,1fr)] md:gap-16 md:px-12 md:pt-8 md:pb-10">
          <div className="flex flex-col gap-8">
            {data.queries.length > 0 && (
              <div className="flex flex-col gap-2">
                <h2 className="label-caps mb-1 text-ink-2">Suggestions</h2>
                {data.queries.map((s) => (
                  <Link
                    key={s.text}
                    href={`/search?q=${encodeURIComponent(s.text)}`}
                    onClick={onClose}
                    className="block py-2 leading-[1.25] no-underline"
                  >
                    <Highlight text={s.text} query={q} />
                  </Link>
                ))}
              </div>
            )}
            {data.collections.length > 0 && (
              <div className="flex flex-col gap-2">
                <h2 className="label-caps mb-1 text-ink-2">Collections</h2>
                {data.collections.map((c) => (
                  <Link
                    key={c.handle}
                    href={`/collections/${c.handle}`}
                    onClick={onClose}
                    className="flex min-h-9 items-center justify-between no-underline"
                  >
                    {c.title}
                    <ArrowRight size={16} />
                  </Link>
                ))}
              </div>
            )}
          </div>
          {data.products.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h2 className="label-caps text-ink-2">Products</h2>
                <Link href={resultsHref} onClick={onClose} className="arrow-link min-h-11">
                  View all results for “{q}”
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-5" onClick={(e) => (e.target as HTMLElement).closest("a") && onClose()}>
                {data.products.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} variant="compact" sizes="(min-width: 768px) 20vw, 50vw" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
