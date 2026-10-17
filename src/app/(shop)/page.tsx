import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ClothBand } from "@/components/cloth-band";
import { ProductVisual } from "@/components/cloth";
import { ArrowRight } from "@/components/icons";
import { Newsletter } from "@/components/newsletter";
import { ProductGrid, ProductRail } from "@/components/product-card";
import { GridSkeleton } from "@/components/skeletons";
import { clothLinks, homeFeature } from "@/lib/catalog";
import { getCountry } from "@/lib/market";
import { getCollectionOrAll } from "@/lib/shopify";
import { nav, site } from "@/lib/site";

const DEPARTMENTS = [
  { title: "Women", href: "/collections/women", blurb: "Dresses, sets, boubous, headwraps", cta: "Shop women", tone: "#4A3F3A", soft: "#DCD5CC" },
  { title: "Men", href: "/collections/men", blurb: "Kaftans, agbada, shirts, trousers", cta: "Shop men", tone: "#2F3438", soft: "#D2D5D8" },
];

export default async function HomePage() {
  const [{ campaign, collection, products }, cloths] = await Promise.all([homeFeature(), clothLinks()]);
  const [newest, next] = products;

  // The "home" campaign metaobject sets the hero. Without one, the newest piece leads it.
  const lead = campaign ? null : newest;
  const label = campaign?.label ?? "New in";
  const headline = campaign?.headline ?? lead?.title ?? site.brand;
  const body = campaign?.body ?? (collection?.description || site.description);
  const image = campaign?.image ?? lead?.featuredImage ?? null;
  // The small picture beside the copy: the newest piece under a campaign, the next one otherwise.
  const featured = campaign ? newest : next;
  const ctaHref = campaign ? (campaign.link ?? "/collections/new-in") : lead ? `/products/${lead.handle}` : "/collections/new-in";
  const ctaLabel = campaign ? (campaign.cta ?? "Shop the edit") : lead ? "Shop now" : "Shop new in";
  // The design sets a three-word headline at display size; product names get a smaller one.
  const long = headline.length > 20;

  const heroImage = image && (
    <Image
      src={image.url}
      alt={image.altText ?? lead?.title ?? ""}
      fill
      preload
      sizes="(min-width: 768px) 58vw, 100vw"
      className="object-cover"
    />
  );

  return (
    <>
      {/* Hero */}
      <section className="md:page-x md:flex md:flex-wrap md:gap-12 md:pt-8 md:pb-[120px]">
        <div className="relative h-[488px] overflow-hidden bg-[#2B3049] md:aspect-[4/5] md:h-auto md:max-h-[860px] md:min-w-0 md:flex-[7_1_560px]">
          {lead && heroImage ? (
            <Link href={`/products/${lead.handle}`} className="absolute inset-0">
              {heroImage}
            </Link>
          ) : (
            heroImage
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-between gap-12 px-4 pt-7 pb-8 md:flex-[5_1_380px] md:px-0 md:pt-6 md:pb-0">
          <div className="flex flex-col gap-4 md:gap-7">
            <span className="text-[11px] tracking-[0.16em] text-ink-2 uppercase md:text-[12px]">{label}</span>
            <h1
              className={`font-display tracking-[-0.02em] ${
                long
                  ? "text-[40px] leading-[1] md:text-[clamp(44px,4.4vw,64px)]"
                  : "text-[52px] leading-[0.95] md:text-[clamp(56px,6.4vw,96px)] md:leading-[0.94]"
              }`}
            >
              {headline}
            </h1>
            <p className="max-w-[420px] leading-[1.6] text-ink-2 md:text-[17px]">{body}</p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
              <Link href={ctaHref} className="btn btn-ink w-full md:w-auto md:px-9">
                {ctaLabel}
              </Link>
              <div className="hidden gap-6 text-[14px] md:flex">
                <Link href="/collections/women" className="py-3 underline-offset-[6px]">
                  Women
                </Link>
                <Link href="/collections/men" className="py-3 underline-offset-[6px]">
                  Men
                </Link>
              </div>
            </div>
          </div>
          {featured && (
            <Link href={`/products/${featured.handle}`} className="hidden items-end gap-5 text-ink no-underline hover:text-ink md:flex">
              <span className="relative flex aspect-[4/5] w-[200px] flex-none items-center justify-center overflow-hidden bg-stone">
                <ProductVisual product={featured} image={featured.featuredImage} sizes="200px" />
              </span>
              <span className="flex max-w-[230px] flex-col gap-1.5 text-[13px] leading-[1.55]">
                <span>{featured.title}</span>
                <span className="text-ink-2 underline underline-offset-4">Shop now</span>
              </span>
            </Link>
          )}
        </div>
      </section>

      {/* Category chips (phones) */}
      <nav aria-label="Shop categories" className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-10 md:hidden">
        {[nav[1], nav[2], nav[0], nav[3]].map((item) => (
          <Link key={item.href} href={item.href} className="inline-flex h-11 flex-none items-center border border-line px-[18px] text-[14px] no-underline">
            {item.label}
          </Link>
        ))}
      </nav>

      {/* New in: prices follow the shopper's country, so this part renders per request. */}
      <Suspense
        fallback={
          <div className="px-4 pb-16 md:page-x md:pb-[120px]">
            <GridSkeleton count={4} />
          </div>
        }
      >
        <NewIn />
      </Suspense>

      {/* Departments */}
      <section
        aria-label="Shop by department"
        className="flex flex-col gap-3 px-4 pb-16 md:page-x md:grid md:grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] md:gap-6 md:pb-[120px]"
      >
        {DEPARTMENTS.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            style={{ backgroundColor: d.tone }}
            className="relative block h-[448px] overflow-hidden text-paper no-underline hover:text-paper md:aspect-[4/5] md:h-auto md:max-h-[820px]"
          >
            <div className="absolute inset-x-5 bottom-5 flex flex-wrap items-end justify-between gap-3 md:inset-x-8 md:bottom-8 md:gap-4">
              <div className="flex flex-col gap-1 md:gap-2">
                <span className="font-display text-[40px] leading-none md:text-[clamp(44px,4vw,64px)]">{d.title}</span>
                <span className="text-[13px] md:text-[14px]" style={{ color: d.soft }}>
                  {d.blurb}
                </span>
              </div>
              <ArrowRight size={22} className="md:hidden" />
              <span className="hidden items-center gap-2.5 border-b border-paper pb-1.5 text-[13px] tracking-[0.12em] uppercase md:inline-flex">
                {d.cta}
                <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        ))}
      </section>

      <ClothBand cloths={cloths} />

      {/* Shopping with us */}
      <section
        aria-label="Shopping with us"
        className="flex flex-col gap-7 px-4 py-14 md:page-x md:grid md:grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] md:gap-x-12 md:gap-y-10 md:py-[120px]"
      >
        {[
          {
            title: "Size guide",
            body: "Garment measurements on every product page, in centimetres and inches",
            more: ", with a note on how each piece is meant to fit",
            end: ".",
          },
          {
            title: "Delivery",
            body: `UK orders are dispatched within ${site.dispatchDays} working days. International rates are shown at checkout.`,
          },
          { title: "Returns", lead: "Changed your mind? ", body: `Send unworn pieces back within ${site.returnDays} days of delivery.` },
        ].map((item) => (
          <div key={item.title} className="flex flex-col gap-2 border-t border-ink pt-4 md:gap-2.5 md:pt-5">
            <h3 className="text-[12px] font-semibold tracking-[0.14em] uppercase md:text-[13px]">{item.title}</h3>
            <p className="max-w-[360px] text-[15px] leading-[1.6] text-ink-2">
              {/* Phones get the shorter line from the mobile design. */}
              {"lead" in item && <span className="hidden md:inline">{item.lead}</span>}
              {item.body}
              {"more" in item && (
                <>
                  <span className="hidden md:inline">{item.more}</span>
                  {item.end}
                </>
              )}
            </p>
          </div>
        ))}
      </section>

      <Newsletter />
    </>
  );
}

async function NewIn() {
  const newIn = await getCollectionOrAll({ handle: "new-in", first: 4, country: await getCountry() });
  if (newIn.products.length === 0) return null;
  return (
    <section aria-labelledby="new-in" className="pb-16 md:page-x md:pb-[120px]">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 pb-5 md:items-end md:px-0 md:pb-8">
        <h2 id="new-in" className="font-display text-[32px] leading-none md:text-[clamp(36px,3.4vw,48px)] md:tracking-[-0.01em]">
          New in
        </h2>
        <Link
          href="/collections/new-in"
          className="inline-flex min-h-11 items-center gap-2.5 text-[12px] tracking-[0.12em] uppercase underline-offset-[6px] md:arrow-link md:py-3"
        >
          View all
          <ArrowRight size={18} className="hidden md:block" />
        </Link>
      </div>
      <div className="md:hidden">
        <ProductRail products={newIn.products} />
      </div>
      <ProductGrid products={newIn.products} tight className="hidden md:grid" />
    </section>
  );
}
