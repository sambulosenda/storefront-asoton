import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ClothBand } from "@/components/cloth-band";
import { ProductVisual } from "@/components/cloth";
import { ArrowRight } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Newsletter } from "@/components/newsletter";
import { ProductGrid, ProductRail } from "@/components/product-card";
import { GridSkeleton } from "@/components/skeletons";
import { deliveryTimes, departmentImage, homeFeature, stockedCloths, stockedOccasions } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { getCountry } from "@/lib/market";
import { getCollectionOrAll } from "@/lib/shopify";
import { nav, site, siteUrl } from "@/lib/site";

const DEPARTMENTS = [
  { handle: "women", title: "Women", href: "/collections/women", blurb: "Dresses, sets, jumpsuits and kimonos", cta: "Shop women", tone: "#4A3F3A", soft: "#DCD5CC" },
  { handle: "men", title: "Men", href: "/collections/men", blurb: "Suits, shirts, jackets and trousers", cta: "Shop men", tone: "#2F3438", soft: "#D2D5D8" },
];

export const metadata: Metadata = {
  title: { absolute: `${site.brand} · ${site.tagline.replace(/\.$/, "")}` },
  alternates: { canonical: "/" },
};

// Who runs the shop, for the brand panel and site name in search results.
const profiles = Object.values(site.social).filter((url) => url.startsWith("http"));
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.brand,
  url: siteUrl,
  description: site.description,
  ...(profiles.length ? { sameAs: profiles } : {}),
};
const website = { "@context": "https://schema.org", "@type": "WebSite", name: site.brand, url: siteUrl };

// Where the copy sits depends on where the people are in the campaign photo.
const FOCUS: Record<string, string> = { left: "35% 50%", centre: "50% 50%", center: "50% 50%", right: "65% 50%" };

export default async function HomePage() {
  const [{ campaign, collection, products }, cloths, departmentImages, occasions, times] = await Promise.all([
    homeFeature(),
    stockedCloths(),
    Promise.all(DEPARTMENTS.map((d) => departmentImage(d.handle))),
    stockedOccasions(),
    deliveryTimes(),
  ]);
  const [newest] = products;

  // The home campaign sets the hero. Without one, the newest piece leads it.
  const lead = campaign ? null : newest;
  const label = campaign?.label ?? "New in";
  const headline = campaign?.headline ?? lead?.title ?? site.brand;
  const body = campaign?.body ?? (collection?.description || site.description);
  const image = campaign?.image ?? null;
  const mobileImage = campaign?.mobileImage ?? image;
  const focus = FOCUS[campaign?.position?.trim().toLowerCase() ?? ""] ?? FOCUS.right;
  // The pieces worn in the photo; the newest pieces stand in until the campaign lists them.
  const pictured = campaign?.products.length ? campaign.products : products;
  // The design sets a short headline at display size; product names get a smaller one.
  const long = headline.length > 24;

  const ctas = [
    { label: "Shop women", href: `/collections/${campaign?.women ?? "women"}`, light: true },
    { label: "Shop men", href: `/collections/${campaign?.men ?? "men"}`, light: false },
  ];
  // An older campaign entry with its own button keeps it, in place of "Shop women".
  if (campaign?.cta) ctas[0] = { label: campaign.cta, href: campaign.link ?? ctas[0].href, light: true };
  if (lead) ctas.unshift({ label: "Shop now", href: `/products/${lead.handle}`, light: true });

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={website} />
      {/* Hero: the campaign photo full width with the copy over it, or the pieces side by side until there's a photo. */}
      <section
        aria-labelledby="hero-title"
        className={`relative overflow-hidden bg-clay text-paper ${image ? "h-[min(808px,calc(100svh-97px))] min-h-[600px] md:h-[clamp(600px,56vw,860px)] md:max-h-none" : ""}`}
      >
        {image && (
          <>
            <Image
              src={mobileImage!.url}
              alt={mobileImage!.altText ?? ""}
              fill
              preload
              sizes="100vw"
              className="object-cover md:hidden"
              style={{ objectPosition: focus }}
            />
            <Image
              src={image.url}
              alt={image.altText ?? ""}
              fill
              preload
              sizes="100vw"
              className="hidden object-cover md:block"
              style={{ objectPosition: focus }}
            />
            {/* Scrims keep the type readable on any photo. */}
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[190px] bg-linear-to-b from-ink/55 via-ink/12 via-70% to-transparent md:h-[260px]" />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[66%] bg-linear-to-t from-ink/66 via-ink/18 via-55% to-transparent md:h-[64%]" />
            <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-[58%] bg-linear-to-r from-ink/30 to-transparent md:block" />
          </>
        )}
        <div
          className={`on-dark flex flex-col gap-8 px-4 pb-6 md:page-x md:flex-row md:flex-wrap md:items-end md:justify-between md:pb-16 ${
            image ? "absolute inset-x-0 bottom-0" : "relative pt-14 md:pt-[120px]"
          }`}
        >
          <div className="flex max-w-[720px] flex-col gap-3.5 md:gap-6">
            <span className="text-[11px] tracking-[0.18em] uppercase md:text-[12px]">{label}</span>
            <h1
              id="hero-title"
              className={`font-display leading-[0.92] tracking-[-0.025em] ${
                long ? "text-[44px] md:text-[clamp(48px,5vw,72px)]" : "text-[60px] md:text-[clamp(52px,7.2vw,104px)]"
              }`}
            >
              <Headline text={headline} italic={campaign?.italic ?? null} />
            </h1>
            <p className="max-w-[520px] text-[15px] leading-[1.55] text-paper/90 md:text-[18px]">{body}</p>
            <div className="grid grid-cols-2 gap-2 pt-1.5 md:flex md:flex-wrap md:gap-3 md:pt-2">
              {ctas.slice(0, lead ? 1 : 2).map((cta) => (
                <Link
                  key={cta.label}
                  href={cta.href}
                  className={`inline-flex h-[52px] items-center justify-center px-3 text-[13px] font-semibold tracking-[0.14em] uppercase no-underline md:min-w-[184px] md:px-7 ${
                    cta.light ? "bg-paper text-ink hover:text-ink" : "border border-paper text-paper hover:text-paper"
                  }`}
                >
                  {cta.label}
                </Link>
              ))}
            </div>
          </div>
          {pictured.length > 0 &&
            (image ? (
              <nav aria-label="In the picture" className="hidden w-[380px] max-w-full flex-col gap-0.5 md:flex">
                <span className="pb-1.5 text-[11px] tracking-[0.16em] uppercase">In the picture</span>
                {pictured.slice(0, 3).map((p) => (
                  <Link
                    key={p.handle}
                    href={`/products/${p.handle}`}
                    className="flex min-h-11 items-center gap-3 border-t border-paper/32 text-[15px] text-paper no-underline hover:text-paper"
                  >
                    <span className="min-w-0 flex-auto">{p.title}</span>
                    <span className="text-[14px] whitespace-nowrap text-paper/85">{formatMoney(p.priceRange.minVariantPrice)}</span>
                    <ArrowRight size={16} />
                  </Link>
                ))}
              </nav>
            ) : (
              <nav aria-label="In the picture" className="grid grid-cols-2 gap-3 md:w-[min(560px,46%)] md:gap-6">
                {pictured.slice(0, 2).map((p) => (
                  <Link key={p.handle} href={`/products/${p.handle}`} className="flex flex-col gap-3 text-[13px] text-paper no-underline hover:text-paper md:text-[14px]">
                    <span className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-stone">
                      <ProductVisual product={p} image={p.featuredImage} sizes="(min-width: 768px) 280px, 50vw" />
                    </span>
                    <span className="flex justify-between gap-3">
                      <span className="min-w-0">{p.title}</span>
                      <span className="whitespace-nowrap text-paper/85">{formatMoney(p.priceRange.minVariantPrice)}</span>
                    </span>
                  </Link>
                ))}
              </nav>
            ))}
        </div>
      </section>

      {/* Category chips (phones) */}
      <nav aria-label="Shop categories" className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-6 pb-10 md:hidden">
        {[nav[1], nav[2], nav[3], nav[0], nav[4]].map((item) => (
          <Link key={item.href} href={item.href} className="inline-flex h-11 flex-none items-center border border-line px-[18px] text-[14px] no-underline">
            {item.label}
          </Link>
        ))}
      </nav>

      {/* New in: prices follow the shopper's country, so this part renders per request. */}
      <Suspense
        fallback={
          <div className="px-4 pb-16 md:page-x md:pt-[120px] md:pb-[120px]">
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
        {DEPARTMENTS.map((d, i) => (
          <Link
            key={d.href}
            href={d.href}
            style={{ backgroundColor: d.tone }}
            className="relative block h-[448px] overflow-hidden text-paper no-underline hover:text-paper md:aspect-[4/5] md:h-auto md:max-h-[820px]"
          >
            {departmentImages[i] && (
              <>
                <Image
                  src={departmentImages[i].url}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                {/* Keeps the white type readable on light photos. */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
              </>
            )}
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

      {/* Shop by occasion, from the "occasion" entries in Shopify. */}
      {occasions.length > 0 && (
        <section aria-labelledby="occasion" className="px-4 pb-16 md:page-x md:pb-[120px]">
          <h2 id="occasion" className="pb-4 font-display text-[32px] leading-none md:pb-6 md:text-[clamp(36px,3.4vw,48px)] md:tracking-[-0.01em]">
            Shop by occasion
          </h2>
          <ul className="border-t border-ink md:grid md:grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] md:gap-x-6 md:border-t-0">
            {occasions.map((o) => (
              <li key={o.handle} className="border-b border-line md:border-t md:border-b-0 md:border-ink">
                <Link
                  href={o.collection ? `/collections/${o.collection}` : `/search?q=${encodeURIComponent(o.name)}`}
                  className="flex min-h-[72px] items-center justify-between gap-3 no-underline md:min-h-[120px] md:gap-4 md:py-6"
                >
                  <span className="flex flex-col md:gap-1.5">
                    <span className="font-display text-[24px] leading-[1.15] md:text-[30px] md:leading-[1.1]">{o.name}</span>
                    {o.intro && <span className="text-[13px] text-ink-2 md:text-[14px]">{o.intro}</span>}
                  </span>
                  <ArrowRight size={20} className="flex-none" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

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
            body: `Ready-to-ship pieces leave us within ${times.dispatch}. Made-to-order pieces are made to your size in 14 days.`,
          },
          { title: "Returns", lead: "Changed your mind? ", body: `Send unworn ready-to-ship pieces back within ${site.returnDays} days of delivery. Made-to-order pieces come back only if faulty.` },
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
    <section aria-labelledby="new-in" className="pb-16 md:page-x md:pt-[120px] md:pb-[120px]">
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

/** The headline with its italic words (the campaign's italic_word) set in italic, on a line of their own. */
function Headline({ text, italic }: { text: string; italic: string | null }) {
  const at = italic ? text.lastIndexOf(italic) : -1;
  if (!italic || at < 0) return text;
  const before = text.slice(0, at).trimEnd();
  return (
    <>
      {before}
      {before && <br />}
      <em>{italic}</em>
      {text.slice(at + italic.length)}
    </>
  );
}
