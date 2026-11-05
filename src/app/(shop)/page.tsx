import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense, type CSSProperties } from "react";
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
import { collectionPath, collections, nav, site, siteUrl } from "@/lib/site";

const DEPARTMENTS = [
  { dept: "women", title: "Women", href: collectionPath("women"), blurb: "Dresses, sets, jumpsuits and kimonos", cta: "Shop women", tone: "#4A3F3A", soft: "#DCD5CC" },
  { dept: "men", title: "Men", href: collectionPath("men"), blurb: "Suits, shirts, jackets and trousers", cta: "Shop men", tone: "#2F3438", soft: "#D2D5D8" },
] as const;

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
  logo: `${siteUrl}/logo.png`,
  description: site.description,
  ...(profiles.length ? { sameAs: profiles } : {}),
};
const website = { "@context": "https://schema.org", "@type": "WebSite", name: site.brand, url: siteUrl };

// The shop's own line, from its logo, leads the hero until a campaign sets one.
const BRAND_LINE = {
  text: "Pride & beauty of African fashion",
  italic: "African fashion",
  body: `${site.tagline.replace(/\.$/, "")}. Ready to ship, or made to order in your size.`,
};

// Where the copy sits depends on where the people are in the campaign photo.
const FOCUS: Record<string, string> = { left: "35% 50%", centre: "50% 50%", center: "50% 50%", right: "65% 50%" };

export default async function HomePage() {
  const [{ campaign, products }, cloths, departmentImages, occasions, times] = await Promise.all([
    homeFeature(),
    stockedCloths(),
    Promise.all(DEPARTMENTS.map((d) => departmentImage(d.dept))),
    stockedOccasions(),
    deliveryTimes(),
  ]);
  // The home campaign sets the hero: its photo full width with the copy over it. Without a photo,
  // the hero is editorial: the brand's line set large beside photos of the newest pieces.
  const image = campaign?.image ?? null;
  const mobileImage = campaign?.mobileImage ?? image;
  const label = campaign?.label ?? "New in";
  const headline = campaign?.headline ?? BRAND_LINE.text;
  const italic = campaign ? (campaign.italic ?? null) : BRAND_LINE.italic;
  const body = campaign?.body ?? BRAND_LINE.body;
  const focus = FOCUS[campaign?.position?.trim().toLowerCase() ?? ""] ?? FOCUS.right;
  // The pieces worn in the photo; the newest pieces stand in until the campaign lists them.
  // Those with a photo come first, so the editorial hero shows photos rather than drawings.
  const pictured = [...(campaign?.products.length ? campaign.products : products)].sort(
    (a, b) => Number(!a.featuredImage) - Number(!b.featuredImage),
  );

  const ctas = [
    { label: "Shop women", href: campaign?.women ? `/collections/${campaign.women}` : collectionPath("women"), primary: true },
    { label: "Shop men", href: campaign?.men ? `/collections/${campaign.men}` : collectionPath("men"), primary: false },
  ];
  // An older campaign entry with its own button keeps it, in place of "Shop women".
  if (campaign?.cta) ctas[0] = { label: campaign.cta, href: campaign.link ?? ctas[0].href, primary: true };

  const copy = (dark: boolean) => (
    <div className="flex max-w-[720px] flex-col gap-4 md:gap-6">
      <span className="rise text-[11px] tracking-[0.18em] uppercase md:text-[12px]">{label}</span>
      <h1
        id="hero-title"
        style={{ "--i": 1 } as CSSProperties}
        className={`rise font-display leading-[0.94] tracking-[-0.025em] text-balance ${
          dark ? "text-[60px] md:text-[clamp(52px,7.2vw,104px)]" : "text-[52px] md:text-[clamp(60px,6.4vw,112px)]"
        }`}
      >
        <Headline text={headline} italic={italic} />
      </h1>
      <p
        style={{ "--i": 2 } as CSSProperties}
        className={`rise max-w-[460px] text-[15px] leading-[1.6] md:text-[17px] ${dark ? "text-paper/90" : "text-ink-2"}`}
      >
        {body}
      </p>
      <div style={{ "--i": 3 } as CSSProperties} className="rise grid grid-cols-2 gap-2 pt-1.5 md:flex md:flex-wrap md:gap-3 md:pt-2">
        {ctas.map((cta) => (
          <Link
            key={cta.label}
            href={cta.href}
            className={`inline-flex h-[52px] items-center justify-center px-3 text-[13px] font-semibold tracking-[0.14em] uppercase no-underline transition-colors duration-(--duration-quick) md:min-w-[184px] md:px-7 ${
              dark
                ? cta.primary
                  ? "bg-paper text-ink hover:text-ink"
                  : "border border-paper text-paper hover:text-paper"
                : cta.primary
                  ? "bg-ink text-paper hover:bg-indigo hover:text-paper"
                  : "border border-ink text-ink hover:bg-ink hover:text-paper"
            }`}
          >
            {cta.label}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={website} />
      {image ? (
        <section
          aria-labelledby="hero-title"
          className="relative h-[min(808px,calc(100svh-97px))] min-h-[600px] overflow-hidden bg-clay text-paper md:h-[clamp(600px,56vw,860px)] md:max-h-none"
        >
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
          <div className="on-dark absolute inset-x-0 bottom-0 flex flex-col gap-8 px-4 pb-6 md:page-x md:flex-row md:flex-wrap md:items-end md:justify-between md:pb-16">
            {copy(true)}
            {pictured.length > 0 && (
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
            )}
          </div>
        </section>
      ) : (
        <section
          aria-labelledby="hero-title"
          className="overflow-hidden pt-8 pb-12 md:page-x md:grid md:min-h-[min(860px,calc(100svh-97px))] md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center md:gap-x-[clamp(32px,5vw,96px)] md:py-16"
        >
          <div className="px-4 pb-8 md:px-0 md:pb-0">{copy(false)}</div>
          {pictured.length > 0 && (
            <nav
              aria-label="In the picture"
              className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 md:grid md:grid-cols-2 md:items-start md:gap-6 md:overflow-visible md:px-0"
            >
              {pictured.slice(0, 2).map((p, i) => (
                <Link
                  key={p.handle}
                  href={`/products/${p.handle}`}
                  style={{ "--i": 2 + i * 2 } as CSSProperties}
                  className={`rise group flex w-[76vw] max-w-[360px] flex-none snap-start flex-col gap-3 text-[13px] text-ink no-underline hover:text-ink md:w-auto md:max-w-none md:text-[14px] ${
                    i === 1 ? "md:mt-[22%]" : ""
                  }`}
                >
                  <span className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-stone">
                    <span className="absolute inset-0 transition-transform duration-(--duration-slow) ease-(--ease-out-soft) group-hover:scale-[1.03]">
                      <ProductVisual product={p} image={p.featuredImage} priority={i === 0} sizes="(min-width: 768px) 28vw, 76vw" />
                    </span>
                  </span>
                  <span className="flex justify-between gap-3">
                    <span className="min-w-0">{p.title}</span>
                    <span className="whitespace-nowrap text-ink-2">{formatMoney(p.priceRange.minVariantPrice)}</span>
                  </span>
                </Link>
              ))}
            </nav>
          )}
        </section>
      )}

      {/* Category chips (phones) */}
      <nav aria-label="Shop categories" className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-6 pb-10 md:hidden">
        {[nav[1], nav[2], nav[3], nav[0], ...nav.slice(4)].map((item) => (
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
            className="group reveal relative block h-[448px] overflow-hidden text-paper no-underline hover:text-paper md:aspect-[4/5] md:h-auto md:max-h-[820px]"
          >
            {departmentImages[i] && (
              <>
                <Image
                  src={departmentImages[i].url}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-(--duration-slow) ease-(--ease-out-soft) group-hover:scale-[1.03]"
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
  const newIn = await getCollectionOrAll({ handle: collections.newIn, first: 4, country: await getCountry() });
  if (newIn.products.length === 0) return null;
  return (
    <section aria-labelledby="new-in" className="pb-16 md:page-x md:pt-[120px] md:pb-[120px]">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 pb-5 md:items-end md:px-0 md:pb-8">
        <h2 id="new-in" className="font-display text-[32px] leading-none md:text-[clamp(36px,3.4vw,48px)] md:tracking-[-0.01em]">
          New in
        </h2>
        <Link
          href={collectionPath("newIn")}
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
