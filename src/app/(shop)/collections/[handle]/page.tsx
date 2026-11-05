import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CollectionBrowser } from "@/components/collection-browser";
import { Editorial } from "@/components/editorial";
import { breadcrumbs, JsonLd } from "@/components/json-ld";
import { CollectionSkeleton } from "@/components/skeletons";
import { notFound } from "next/navigation";
import { departmentMenu, parentDepartment } from "@/lib/catalog";
import { parseFilters, parseSort } from "@/lib/filters";
import { getCountry } from "@/lib/market";
import { getCampaign, getCollection, getCollectionOrAll, getMenu } from "@/lib/shopify";
import { collectionName, collectionPath, collections, departmentNames, departmentOf, departments, site, siteUrl } from "@/lib/site";

const titleFromHandle = (handle: string) =>
  handle.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

/** Pages that show the newest or all products when the store has no collection for them. */
const standIns: Record<string, string> = { all: "All products", [collections.newIn]: "New in" };

export async function generateMetadata({ params }: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const page = await getCollection({ handle, first: 1 });
  const collection = page?.collection;
  // Throwing here, before the page streams, sends search engines a real 404 status.
  if (!collection && !standIns[handle]) notFound();
  const title = collection ? (departmentOf(handle) ? collectionName(handle, collection.title) : collection.title) : standIns[handle];
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
    // New in without its collection is the newest products, a copy of the catalogue.
    ...(collection || handle === "all" ? {} : { robots: { index: false, follow: true } }),
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
  // Sub-categories like Dresses show their department's chips and breadcrumb, with themselves selected.
  const parent = await parentDepartment(handle);
  const dept = departmentOf(handle) ?? parent;
  const [page, menu, campaign] = await Promise.all([
    standIns[handle] ? getCollectionOrAll({ handle, sort, filters, country }) : getCollection({ handle, sort, filters, country }),
    // Departments fall back to the design's categories until their menus exist in Shopify.
    dept ? departmentMenu(dept) : getMenu(handle),
    // Department campaigns go by the department ("women"), others by the collection's handle.
    getCampaign(departmentOf(handle) ?? handle),
  ]);
  if (!page) notFound();

  const department = departments[handle];
  const title = page.collection ? collectionName(handle, page.collection.title) : (standIns[handle] ?? titleFromHandle(handle));
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
  const allPath = parent ? collectionPath(parent) : path;
  const categories = [
    { title: "All", href: allPath, current: allPath === path },
    ...menu.filter((link) => link.href !== allPath).map((link) => ({ ...link, current: link.href === path })),
  ];

  return (
    <>
      {page.collection && (
        <JsonLd
          data={breadcrumbs(siteUrl, [
            { name: "Home", path: "/" },
            ...(parent ? [{ name: departmentNames[parent], path: allPath }] : []),
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
            {parent && (
              <>
                <li>
                  <Link href={allPath} className="text-ink-2 underline-offset-4">
                    {departmentNames[parent]}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
              </>
            )}
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
