import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense, type CSSProperties } from "react";
import { ArrowRight } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Newsletter } from "@/components/newsletter";
import { ProductGrid, ProductRail } from "@/components/product-card";
import { GridSkeleton } from "@/components/skeletons";
import { collectionImage, deliveryThreshold, deliveryTimes, departmentImage, homeFeature, homePromos, isAfricanPiece, stockedOccasions } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { getCountry } from "@/lib/market";
import { getCollectionOrAll } from "@/lib/shopify";
import { collectionPath, collections, nav, site, siteUrl } from "@/lib/site";

// The four ways into the shop. Fabric & lace sits beside the clothes: the cloth is what the shop knows.
const TILES = [
  { key: "women", title: "Women", href: collectionPath("women"), blurb: "Dresses, sets, jumpsuits and kimonos", cta: "Shop women" },
  { key: "men", title: "Men", href: collectionPath("men"), blurb: "Suits, shirts, jackets and trousers", cta: "Shop men" },
  { key: "kids", title: "Kids", href: collectionPath("kids"), blurb: "Girls’ dresses and skirts in African print", cta: "Shop kids" },
  { key: "fabric", title: "Fabric & lace", href: collectionPath("fabric"), blurb: "Six-yard Ankara and handwoven kente", cta: "Shop fabric" },
] as const;

export const metadata: Metadata = {
  title: { absolute: `${site.brand} · ${site.tagline.replace(/\.$/, "")}` },
  alternates: { canonical: "/" },
};

// Who runs the shop and where to reach it, for the brand panel and site name in search results.
const profiles = Object.values(site.social).filter((url) => url.startsWith("http"));
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.brand,
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description: site.description,
  legalName: site.company,
  telephone: site.phone,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.addressParts.street,
    addressLocality: site.addressParts.town,
    postalCode: site.addressParts.postcode,
    addressCountry: site.addressParts.country,
  },
  ...(profiles.length ? { sameAs: profiles } : {}),
};
const website = { "@context": "https://schema.org", "@type": "WebSite", name: site.brand, url: siteUrl };

// The shop's own line, from its logo, leads the hero until a campaign sets one.
const BRAND_LINE = {
  text: "Pride & beauty of African fashion",
  italic: "African fashion",
  body: site.tagline,
};

// Where the copy sits depends on where the people are in the campaign photo.
const FOCUS: Record<string, string> = { left: "35% 50%", centre: "50% 50%", center: "50% 50%", right: "65% 50%" };

export default async function HomePage() {
  const [{ campaign, products }, tileImages, occasions, times, threshold] = await Promise.all([
    homeFeature(),
    Promise.all(TILES.map((t) => (t.key === "fabric" ? collectionImage(collections.fabric) : departmentImage(t.key)))),
    stockedOccasions(),
    deliveryTimes(),
    deliveryThreshold(),
  ]);
  // The home campaign sets the hero: its photo full width with the copy over it. Without a photo,
  // the hero is editorial: the brand's line set large beside photos of the newest pieces.
  const image = campaign?.image ?? null;
  const mobileImage = campaign?.mobileImage ?? image;
  // Only a campaign's own label shows above the headline; the brand line stands on its own.
  const label = campaign?.label ?? null;
  const headline = campaign?.headline ?? BRAND_LINE.text;
  const italic = campaign ? (campaign.italic ?? null) : BRAND_LINE.italic;
  const body = campaign?.body ?? BRAND_LINE.body;
  const focus = FOCUS[campaign?.position?.trim().toLowerCase() ?? ""] ?? FOCUS.right;
  // The pieces worn in the photo; the newest pieces stand in until the campaign lists them.
  // Those with a photo come first, so the editorial hero shows photos rather than drawings.
  const pictured = [...(campaign?.products.length ? campaign.products : products)].sort(
    (a, b) => Number(!a.featuredImage) - Number(!b.featuredImage),
  );
  // Without a campaign photo the hero is still a photo: the pictured pieces' own, three across on
  // wide screens and the first alone on phones.
  const photos = image ? [] : pictured.flatMap((p) => (p.featuredImage ? [p.featuredImage] : [])).slice(0, 3);
  // The pieces the hero shows, so New in doesn't show them again right below.
  const inHero = pictured.slice(0, 3).map((p) => p.handle);
  const promos = await homePromos({
    hrefs: TILES.map((t) => t.href),
    images: [image, mobileImage, ...photos].flatMap((i) => (i ? [i.url] : [])),
  });

  const ctas = [
    { label: "Shop women", href: campaign?.women ? `/collections/${campaign.women}` : collectionPath("women"), primary: true },
    { label: "Shop men", href: campaign?.men ? `/collections/${campaign.men}` : collectionPath("men"), primary: false },
  ];
  // An older campaign entry with its own button keeps it, in place of "Shop women".
  if (campaign?.cta) ctas[0] = { label: campaign.cta, href: campaign.link ?? ctas[0].href, primary: true };

  // The copy sits over the photo, in light type on the scrims.
  const copy = (
    <div className="flex max-w-[720px] flex-col gap-3.5 md:gap-6">
      {label && <span className="rise text-[11px] tracking-[0.18em] uppercase md:text-[12px]">{label}</span>}
      <h1
        id="hero-title"
        style={{ "--i": 1 } as CSSProperties}
        className="rise font-display text-[48px] leading-[0.94] tracking-[-0.025em] text-balance md:text-[clamp(52px,7.2vw,104px)]"
      >
        <Headline text={headline} italic={italic} />
      </h1>
      <p style={{ "--i": 2 } as CSSProperties} className="rise max-w-[460px] text-[15px] leading-[1.6] text-pretty text-paper/90 md:text-[17px]">
        {body}
      </p>
      <div style={{ "--i": 3 } as CSSProperties} className="rise grid grid-cols-2 gap-2 pt-1.5 md:flex md:flex-wrap md:gap-3 md:pt-2">
        {ctas.map((cta) => (
          <Link
            key={cta.label}
            href={cta.href}
            className={`inline-flex h-[52px] items-center justify-center px-3 text-[13px] font-semibold tracking-[0.14em] uppercase no-underline transition-colors duration-(--duration-quick) md:min-w-[184px] md:px-7 ${
              cta.primary ? "bg-paper text-ink hover:text-ink" : "border border-paper text-paper hover:bg-paper hover:text-ink"
            }`}
          >
            {cta.label}
          </Link>
        ))}
      </div>
    </div>
  );

  // The four main ways in on phones; the rest are in the menu.
  const chips = (spacing: string) => (
    <nav aria-label="Shop categories" className={`grid grid-cols-4 gap-2 px-4 md:hidden ${spacing}`}>
      {[nav[1], nav[2], nav[3], nav[0]].map((item) => (
        <Link key={item.href} href={item.href} className="inline-flex h-11 items-center justify-center border border-line px-2 text-[14px] whitespace-nowrap no-underline">
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={website} />
      <section
        aria-labelledby="hero-title"
        className="relative h-[min(760px,calc(100svh-97px))] min-h-[560px] overflow-hidden bg-clay text-paper md:h-[clamp(600px,56vw,860px)]"
      >
        {image ? (
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
          </>
        ) : (
          photos.length > 0 && (
            // The pieces' own photos side by side, edge to edge; faces sit high in a product shot.
            <div className="absolute inset-0 grid md:grid-cols-(--cols)" style={{ "--cols": `repeat(${photos.length}, minmax(0, 1fr))` } as CSSProperties}>
              {photos.map((photo, i) => (
                <div key={photo.url} className={`relative ${i > 0 ? "hidden md:block" : ""}`}>
                  <Image
                    src={photo.url}
                    alt={photo.altText ?? ""}
                    fill
                    preload={i === 0}
                    sizes={`(min-width: 768px) ${Math.round(100 / photos.length)}vw, 100vw`}
                    className="object-cover object-[50%_18%]"
                  />
                </div>
              ))}
            </div>
          )
        )}
        {/* Scrims keep the type readable on any photo. */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[150px] bg-linear-to-b from-ink/40 to-transparent md:h-[220px]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[72%] bg-linear-to-t from-ink/78 via-ink/30 via-55% to-transparent md:h-[64%] md:from-ink/70" />
        <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-[58%] bg-linear-to-r from-ink/36 to-transparent md:block" />
        <div className="on-dark absolute inset-x-0 bottom-0 flex flex-col gap-8 px-4 pb-6 md:page-x md:flex-row md:flex-wrap md:items-end md:justify-between md:pb-16">
          {copy}
          {pictured.length > 0 && (
            <nav aria-label="In the picture" className="hidden w-[380px] max-w-full flex-col gap-0.5 lg:flex">
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

      {/* How buying works, in one line under the hero, where people decide. */}
      <ul aria-label="Delivery and returns" className="grid grid-cols-3 border-b border-line md:page-x">
        {[
          { lead: "Ready to ship", rest: times.dispatch, href: "/help#delivery" },
          { lead: "Made to order", rest: "your size in 14 days", href: "/help#delivery" },
          { lead: `${site.returnDays}-day returns`, rest: "on ready to ship", href: "/help#returns" },
        ].map((item) => (
          <li key={item.lead} className="border-line not-first:border-l md:border-l-0">
            <Link
              href={item.href}
              className="flex h-full flex-col items-center justify-center gap-0.5 px-2 py-3 text-center text-[12px] leading-[1.35] no-underline md:flex-row md:gap-1.5 md:py-4 md:text-[14px]"
            >
              <span className="font-semibold">{item.lead}</span>
              <span className="text-ink-2">{item.rest}</span>
            </Link>
          </li>
        ))}
      </ul>

      {chips("pt-6 pb-8")}

      {/* Smaller banners under the hero: the rest of the shop, or the "promo" campaign entries. */}
      {promos.length > 0 && (
        <section aria-label="More to shop" className="pb-16 md:page-x md:pt-12 md:pb-0">
          <ul
            style={{ "--cols": `repeat(${promos.length}, minmax(0, 1fr))` } as CSSProperties}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 [scrollbar-width:none] md:grid md:grid-cols-(--cols) md:gap-6 md:overflow-visible md:px-0"
          >
            {promos.map((promo) => (
              <li key={promo.href + promo.title} className="w-[78%] flex-none snap-start md:w-auto">
                <Link href={promo.href} className="group flex flex-col gap-3 no-underline">
                  <span className={`relative block aspect-[4/5] overflow-hidden bg-stone ${promos.length < 3 ? "md:aspect-[4/3]" : "md:aspect-[5/4]"}`}>
                    <Image
                      src={promo.image.url}
                      alt=""
                      fill
                      sizes={`(min-width: 768px) ${Math.round(100 / promos.length)}vw, 78vw`}
                      className="object-cover object-[50%_30%] transition-transform duration-(--duration-slow) ease-(--ease-out-soft) group-hover:scale-[1.03]"
                    />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="font-display text-[26px] leading-none md:text-[32px]">{promo.title}</span>
                    {promo.blurb && <span className="text-[14px] text-ink-2">{promo.blurb}</span>}
                    <span className="mt-1.5 inline-flex items-center gap-2 self-start border-b border-ink pb-1 text-[12px] tracking-[0.12em] uppercase">
                      Shop now
                      <ArrowRight size={14} />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* New in: prices follow the shopper's country, so this part renders per request. */}
      <Suspense
        fallback={
          <div className="px-4 pb-16 md:page-x md:pt-[120px] md:pb-[120px]">
            <GridSkeleton count={4} />
          </div>
        }
      >
        <NewIn exclude={inHero} />
      </Suspense>

      {/* Departments: two by two on phones, four across on wide screens. */}
      <section
        aria-label="Shop by department"
        className="grid grid-cols-2 gap-3 px-4 pb-16 md:page-x md:gap-6 md:pb-[120px] lg:grid-cols-4"
      >
        {TILES.map((t, i) => (
          <Link
            key={t.href}
            href={t.href}
            className="group reveal relative block aspect-[3/4] overflow-hidden bg-ink text-paper no-underline hover:text-paper"
          >
            {tileImages[i] && (
              <>
                <Image
                  src={tileImages[i].url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-(--duration-slow) ease-(--ease-out-soft) group-hover:scale-[1.03]"
                />
                {/* Keeps the light type readable on light photos. */}
                <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/10 to-transparent" />
              </>
            )}
            <div className="absolute inset-x-3 bottom-3 flex flex-col gap-1 md:inset-x-6 md:bottom-6 md:gap-2">
              <span className="font-display text-[24px] leading-none whitespace-nowrap md:text-[clamp(32px,2.6vw,44px)]">{t.title}</span>
              <span className="hidden text-[14px] text-paper/85 md:block">{t.blurb}</span>
              <span className="mt-2 hidden items-center gap-2.5 self-start border-b border-paper pb-1.5 text-[13px] tracking-[0.12em] uppercase md:inline-flex">
                {t.cta}
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

      {/* Shopping with us */}
      <section
        aria-labelledby="shopping-with-us"
        className="flex flex-col gap-7 px-4 py-14 md:page-x md:grid md:grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] md:gap-x-12 md:gap-y-10 md:py-[120px]"
      >
        <h2 id="shopping-with-us" className="sr-only">
          Shopping with us
        </h2>
        {[
          {
            title: "Size guide",
            body: "Garment measurements on every product page, in centimetres and inches",
            more: ", with a note on how each piece is meant to fit",
            end: ".",
            link: { label: "See the size guide", href: "/help#size-guide" },
          },
          {
            title: "Delivery",
            body: `Free UK delivery over ${threshold.label}. Ready-to-ship pieces leave us within ${times.dispatch} and arrive ${times.uk} later. Made-to-order pieces are made to your size in 14 days first.`,
            link: { label: "Delivery details", href: "/help#delivery" },
          },
          {
            title: "Returns",
            lead: "Changed your mind? ",
            body: `Send unworn ready-to-ship pieces back within ${site.returnDays} days of delivery. Made-to-order pieces come back only if faulty.`,
            link: { label: "How returns work", href: "/help#returns" },
          },
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
            <Link href={item.link.href} className="self-start text-[14px] underline-offset-4">
              {item.link.label}
            </Link>
          </div>
        ))}
      </section>

      <Newsletter />
    </>
  );
}

async function NewIn({ exclude }: { exclude: string[] }) {
  const all = await getCollectionOrAll({ handle: collections.newIn, first: 12, country: await getCountry() });
  // Not the pieces the hero already shows; African pieces first, in New in's own order within each.
  const products = all.products
    .filter((p) => !exclude.includes(p.handle))
    .sort((a, b) => Number(!isAfricanPiece(a)) - Number(!isAfricanPiece(b)))
    .slice(0, 4);
  if (products.length === 0) return null;
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
        <ProductRail products={products} />
      </div>
      <ProductGrid products={products} tight className="hidden md:grid" />
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
