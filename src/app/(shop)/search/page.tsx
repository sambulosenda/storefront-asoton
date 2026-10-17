import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CollectionBrowser } from "@/components/collection-browser";
import { CollectionSkeleton } from "@/components/skeletons";
import { parseSort } from "@/lib/filters";
import { searchProducts } from "@/lib/shopify";
import { popularSearches } from "@/lib/site";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <Suspense fallback={<CollectionSkeleton />}>
      <SearchResults searchParams={searchParams} />
    </Suspense>
  );
}

function PopularLinks() {
  return (
    <div className="flex flex-wrap gap-2">
      {popularSearches.map((term) => (
        <Link
          key={term}
          href={`/search?q=${encodeURIComponent(term.toLowerCase())}`}
          className="inline-flex h-11 items-center border border-line px-[18px] text-[14px] no-underline hover:border-ink"
        >
          {term}
        </Link>
      ))}
    </div>
  );
}

async function SearchResults({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim().slice(0, 100);
  const sort = parseSort(params.sort);
  const results = q ? await searchProducts({ query: q, sort }) : null;

  return (
    <>
      <section className="page-x pt-4 md:pt-8">
        <nav aria-label="Breadcrumb" className="text-[12px] text-ink-2 md:text-[13px]">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link href="/" className="text-ink-2 underline-offset-4">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Search</li>
          </ol>
        </nav>
        <div className="flex flex-col gap-3 pt-3 pb-5 md:pt-12 md:pb-10">
          <h1 className="font-display text-[44px] leading-[0.95] tracking-[-0.02em] md:text-[clamp(56px,6vw,88px)]">
            {q ? <>Results for “{q}”</> : "Search"}
          </h1>
          <form action="/search" role="search" className="flex max-w-[560px] items-center border-b border-ink">
            <label htmlFor="search-page-q" className="sr-only">
              Search the shop
            </label>
            <input
              id="search-page-q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Adire, kaftan, headwrap…"
              className="h-[52px] min-w-0 flex-1 bg-transparent placeholder:text-muted focus:outline-none"
            />
            <button type="submit" className="h-[52px] cursor-pointer pl-4 text-[13px] font-semibold tracking-[0.14em] uppercase">
              Search
            </button>
          </form>
        </div>
      </section>

      {!results && (
        <div className="page-x flex flex-col gap-4 pb-24">
          <h2 className="label-caps text-ink-2">Popular searches</h2>
          <PopularLinks />
        </div>
      )}

      {results && results.products.length === 0 && (
        <div className="page-x flex max-w-[760px] flex-col gap-4 pb-24">
          <p className="font-display text-[28px] leading-[1.1] md:text-[36px]">No results for “{q}”</p>
          <p className="leading-[1.6] text-ink-2">Check the spelling, or search by cloth or garment instead.</p>
          <div className="pt-2">
            <PopularLinks />
          </div>
        </div>
      )}

      {results && results.products.length > 0 && (
        <CollectionBrowser
          key={JSON.stringify([q, sort])}
          products={results.products}
          pageInfo={results.pageInfo}
          filters={[]}
          selected={[]}
          sort={sort}
          categories={[]}
          categoriesLabel="Search"
          query={q}
        />
      )}
    </>
  );
}
