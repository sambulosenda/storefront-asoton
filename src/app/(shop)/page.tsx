import Image from "next/image";
import Link from "next/link";
import { ClothBand } from "@/components/cloth-band";
import { Garment } from "@/components/cloth";
import { ArrowRight } from "@/components/icons";
import { Newsletter } from "@/components/newsletter";
import { ProductGrid, ProductRail } from "@/components/product-card";
import { clothLinks } from "@/lib/catalog";
import { getCampaign, getCollectionOrAll } from "@/lib/shopify";
import { nav, site } from "@/lib/site";

const DEPARTMENTS = [
  { title: "Women", href: "/collections/women", blurb: "Dresses, sets, boubous, headwraps", cta: "Shop women", tone: "#4A3F3A", soft: "#DCD5CC" },
  { title: "Men", href: "/collections/men", blurb: "Kaftans, agbada, shirts, trousers", cta: "Shop men", tone: "#2F3438", soft: "#D2D5D8" },
];

export default async function HomePage() {
  const [campaign, newIn, cloths] = await Promise.all([
    getCampaign("home"),
    getCollectionOrAll({ handle: "new-in", first: 4 }),
    clothLinks(),
  ]);

  const label = campaign?.label ?? "Collection 01 — Autumn/Winter 2026";
  const body =
    campaign?.body ??
    "Resist-dyed adire cloth, cut into clean, modern shapes — wrap dresses and two-piece sets for her, kaftans and agbada for him.";
  const headline = campaign?.headline ? (
    campaign.headline
  ) : (
    <>
      The <em>Indigo</em>
      <br />
      Edit
    </>
  );
  const campaignImage = campaign?.image && (
    <Image
      src={campaign.image.url}
      alt={campaign.image.altText ?? ""}
      fill
      priority
      sizes="(min-width: 768px) 58vw, 100vw"
      className="object-cover"
    />
  );

  return (
    <>
      {/* Hero */}
      <section className="md:page-x md:flex md:flex-wrap md:gap-12 md:pt-8 md:pb-[120px]">
        <div className="relative h-[488px] overflow-hidden bg-[#2B3049] md:aspect-[4/5] md:h-auto md:max-h-[860px] md:min-w-0 md:flex-[7_1_560px]">
          {campaignImage}
        </div>
        <div className="flex min-w-0 flex-col justify-between gap-12 px-4 pt-7 pb-8 md:flex-[5_1_380px] md:px-0 md:pt-6 md:pb-0">
          <div className="flex flex-col gap-4 md:gap-7">
            <span className="text-[11px] tracking-[0.16em] text-ink-2 uppercase md:text-[12px]">{label}</span>
            <h1 className="font-display text-[52px] leading-[0.95] tracking-[-0.02em] md:text-[clamp(56px,6.4vw,96px)] md:leading-[0.94]">
              {headline}
            </h1>
            <p className="max-w-[420px] leading-[1.6] text-ink-2 md:text-[17px]">{body}</p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
              <Link href="/collections/new-in" className="btn btn-ink w-full md:w-auto md:px-9">
                Shop the edit
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
          <figure className="hidden items-end gap-5 md:flex">
            <div className="flex aspect-[4/5] w-[200px] flex-none items-center justify-center bg-stone">
              <div className="aspect-[3/4] w-[76%]">
                <Garment garment="dress" cloth="adire" />
              </div>
            </div>
            <figcaption className="max-w-[230px] text-[13px] leading-[1.55] text-ink-2">
              The Adire Wrap Dress. Its pattern is painted on in cassava-starch paste before the cloth meets the indigo.
            </figcaption>
          </figure>
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

      {/* New in */}
      {newIn.products.length > 0 && (
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
      )}

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
