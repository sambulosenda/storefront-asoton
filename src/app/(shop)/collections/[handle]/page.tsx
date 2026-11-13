import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CollectionBrowser } from "@/components/collection-browser";
import { Editorial } from "@/components/editorial";
import { breadcrumbs, JsonLd } from "@/components/json-ld";
import { CollectionSkeleton } from "@/components/skeletons";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { movedCollections } from "@/lib/old-links";
import { departmentMenu, parentDepartment } from "@/lib/catalog";
import { parseFilters, parseSort } from "@/lib/filters";
import { getCountry } from "@/lib/market";
import { getCampaign, getCollection, getCollectionCount, getCollectionOrAll, getMenu } from "@/lib/shopify";
import { searchDescription, searchTitle, snippet } from "@/lib/seo";
import { collectionName, collectionPath, collections, departmentNames, departmentOf, departments, site, siteUrl } from "@/lib/site";

const titleFromHandle = (handle: string) =>
  handle.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

/** Pages that show the newest or all products when the store has no collection for them. */
const standIns: Record<string, string> = { all: "All products", [collections.newIn]: "New in" };

/** Where "Load more" had reached, when its link is opened on its own: the cursor Shopify gave for the last product shown. */
const cursorIn = (query: Record<string, string | string[] | undefined>) => (typeof query.after === "string" && query.after ? query.after : null);

export async function generateMetadata({ params, searchParams }: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const [{ handle }, query] = await Promise.all([params, searchParams]);
  const page = await getCollection({ handle, first: 1 });
  const collection = page?.collection;
  // Throwing here, before the page streams, sends search engines a real 404 status
  // (or a permanent redirect, for a collection the old site had moved).
  if (!collection && !standIns[handle]) {
    if (movedCollections[handle]) permanentRedirect(`/collections/${movedCollections[handle]}`);
    notFound();
  }
  const title = collection
    ? departmentOf(handle)
      ? collectionName(handle, collection.title)
      : (searchTitle(collection.seo?.title) ?? collection.title)
    : standIns[handle];
  // Most collections have no text of their own, and without a line here they'd all share the shop's one.
  const description =
    searchDescription(collection?.seo?.description) ||
    (collection?.description && snippet(collection.description)) ||
    departments[handle]?.intro ||
    (collection ? undefined : site.description) ||
    `Shop ${title.toLowerCase().startsWith("african") ? title : `African ${title.toLowerCase()}`} at ${site.brand}. Contemporary African clothing, UK delivery and ${site.returnDays}-day returns.`;
  return {
    title,
    description,
    // Sorted and filtered views point search engines back at the plain collection. A later stretch of
    // it is a page of its own, so the products on it are found by more than the sitemap.
    alternates: {
      canonical:
        cursorIn(query) && !query.sort && !query.filter ? `/collections/${handle}?after=${encodeURIComponent(cursorIn(query)!)}` : `/collections/${handle}`,
    },
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
  const after = cursorIn(query);
  // Sub-categories like Dresses show their department's chips and breadcrumb, with themselves selected.
  const parent = await parentDepartment(handle);
  const dept = departmentOf(handle) ?? parent;
  const [page, menu, campaign, total] = await Promise.all([
    standIns[handle] ? getCollectionOrAll({ handle, sort, filters, after, country }) : getCollection({ handle, sort, filters, after, country }),
    // Departments fall back to the design's categories until their menus exist in Shopify.
    dept ? departmentMenu(dept) : getMenu(handle),
    // Department campaigns go by the department ("women"), others by the collection's handle.
    getCampaign(departmentOf(handle) ?? handle),
    // How many pieces there are in all, so shoppers can see the size of what they're browsing.
    standIns[handle] ? null : getCollectionCount({ handle, filters }),
  ]);
  if (!page) {
    // A cursor Shopify no longer accepts: the collection is still there, so start it from the top.
    if (after) redirect(`/collections/${handle}`);
    if (movedCollections[handle]) permanentRedirect(`/collections/${movedCollections[handle]}`);
    notFound();
  }

  const department = departments[handle];
  const title = page.collection ? collectionName(handle, page.collection.title) : (standIns[handle] ?? titleFromHandle(handle));
  const intro = page.collection?.description || department?.intro;
  // A long description (the store's SEO copy) gives the top its first sentence and goes in full at
  // the foot of the page, where it's still there for search engines but out of the shopper's way.
  const lead = intro && intro.length > 180 ? (intro.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? intro) : intro;
  const more = intro && lead !== intro ? intro : null;
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
          {lead && <p className="line-clamp-3 max-w-[440px] text-[15px] leading-[1.55] text-ink-2 md:text-[16px] md:leading-[1.6]">{lead}</p>}
        </div>
      </section>

      <CollectionBrowser
        key={JSON.stringify([sort, filters, country, after])}
        products={page.products}
        pageInfo={page.pageInfo}
        total={total}
        filters={page.filters}
        selected={filters}
        sort={sort}
        categories={categories}
        categoriesLabel={`${title} categories`}
        editorial={editorial && <Editorial content={editorial} />}
        handle={handle}
        continued={!!after}
      />

      {more && (
        <section aria-labelledby="about-collection" className="page-x pb-16 md:pb-24">
          <div className="max-w-[720px] border-t border-line pt-8">
            <h2 id="about-collection" className="pb-3 text-[12px] font-semibold tracking-[0.14em] uppercase">
              About {title.toLowerCase()}
            </h2>
            <p className="text-[15px] leading-[1.65] text-ink-2">{more}</p>
          </div>
        </section>
      )}
    </>
  );
}
