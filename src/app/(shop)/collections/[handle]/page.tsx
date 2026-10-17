import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CollectionBrowser } from "@/components/collection-browser";
import { Editorial } from "@/components/editorial";
import { breadcrumbs, JsonLd } from "@/components/json-ld";
import { CollectionSkeleton } from "@/components/skeletons";
import { parseFilters, parseSort } from "@/lib/filters";
import { getCountry } from "@/lib/market";
import { getCampaign, getCollection, getCollectionOrAll, getMenu } from "@/lib/shopify";
import { departments, site, siteUrl } from "@/lib/site";

const titleFromHandle = (handle: string) =>
  handle.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export async function generateMetadata({ params }: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const page = await getCollection({ handle, first: 1 });
  const collection = page?.collection;
  const title = collection?.title ?? titleFromHandle(handle);
  const description = collection?.description || departments[handle]?.intro;
  return {
    title,
    description,
    // Sorted and filtered views point search engines back at the plain collection.
    alternates: { canonical: `/collections/${handle}` },
    openGraph: {
      title,
      description,
      url: `/collections/${handle}`,
      siteName: site.brand,
      locale: "en_GB",
      images: [collection?.image ? { url: collection.image.url, alt: collection.image.altText ?? title } : "/opengraph-image"],
    },
    // Until the collection exists in Shopify the page shows the whole catalog, which
    // search engines would see as a copy of every other stand-in page.
    ...(collection ? {} : { robots: { index: false, follow: true } }),
  };
}

export default function CollectionPage({ params, searchParams }: PageProps<"/collections/[handle]">) {
  return (
    <Suspense fallback={<CollectionSkeleton />}>
      <Collection params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Collection({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ handle }, query, country] = await Promise.all([params, searchParams, getCountry()]);
  const sort = parseSort(query.sort);
  const filters = parseFilters(query.filter);
  const [page, menu, campaign] = await Promise.all([
    getCollectionOrAll({ handle, sort, filters, country }),
    getMenu(handle),
    getCampaign(handle),
  ]);

  const department = departments[handle];
  const title = page.collection?.title ?? titleFromHandle(handle);
  const intro = page.collection?.description || department?.intro;
  const path = `/collections/${handle}`;
  // The editorial block only shows once its campaign metaobject exists in Shopify.
  const editorial = campaign?.headline
    ? {
        label: campaign.label,
        title: campaign.headline,
        body: campaign.body,
        cta: campaign.cta ?? "Shop now",
        href: campaign.link,
        image: campaign.image ?? page.collection?.image ?? null,
        tone: department?.tone ?? "#2B3049",
        imageFirst: department?.imageFirst ?? true,
      }
    : null;
  const categories = [
    { title: "All", href: path, current: true },
    ...menu.filter((link) => link.href !== path).map((link) => ({ ...link, current: false })),
  ];

  return (
    <>
      {page.collection && (
        <JsonLd
          data={breadcrumbs(siteUrl, [
            { name: "Home", path: "/" },
            { name: title, path },
          ])}
        />
      )}
      <section className="page-x pt-4 md:pt-8">
        <nav aria-label="Breadcrumb" className="text-[12px] text-ink-2 md:text-[13px]">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link href="/" className="text-ink-2 underline-offset-4">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{title}</li>
          </ol>
        </nav>
        <div className="flex flex-col gap-3 pt-3 pb-5 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-x-16 md:gap-y-6 md:pt-12 md:pb-10">
          <h1 className="font-display text-[56px] leading-[0.95] tracking-[-0.02em] md:text-[clamp(64px,8vw,120px)] md:leading-[0.9]">
            {title}
          </h1>
          {intro && <p className="max-w-[440px] text-[15px] leading-[1.55] text-ink-2 md:text-[16px] md:leading-[1.6]">{intro}</p>}
        </div>
      </section>

      <CollectionBrowser
        key={JSON.stringify([sort, filters, country])}
        products={page.products}
        pageInfo={page.pageInfo}
        filters={page.filters}
        selected={filters}
        sort={sort}
        categories={categories}
        categoriesLabel={`${title} categories`}
        editorial={editorial && <Editorial content={editorial} />}
        handle={handle}
      />
    </>
  );
}
