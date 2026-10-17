import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { homeFeature, stockedCloths } from "@/lib/catalog";
import { getCampaign } from "@/lib/shopify";
import { story } from "@/lib/site";

export const metadata: Metadata = { title: "Our story" };

const BELIEFS = [
  {
    title: "We name the cloth",
    body: "Every piece tells you which cloth it’s cut from, how that cloth is made and where the technique comes from.",
  },
  {
    title: "Made to be worn",
    body: "Cuts that work for a wedding and for a Tuesday. Pieces you’ll keep and wear, not save for once a year.",
  },
  { title: "Made with care", body: story.makers },
];

export default async function StoryPage() {
  const [cloths, storyCampaign, workshopCampaign, { products }] = await Promise.all([
    stockedCloths(),
    getCampaign("story"),
    getCampaign("workshop"),
    homeFeature(),
  ]);
  // The "story" and "workshop" campaign entries hold this page's photos. Until the first exists,
  // the portrait shows the newest piece; the workshop picture only shows once it's set.
  const portrait = storyCampaign?.image ?? products.find((p) => p.featuredImage)?.featuredImage ?? null;
  const workshop = workshopCampaign?.image ?? null;

  return (
    <>
      <section className="page-x flex flex-wrap items-end gap-x-24 gap-y-12 pt-12 pb-20 md:pt-[72px] md:pb-[120px]">
        <div className="flex min-w-0 flex-[7_1_520px] flex-col gap-6 md:gap-8">
          <span className="eyebrow">Our story</span>
          <h1 className="font-display text-[clamp(52px,7vw,112px)] leading-[0.95] tracking-[-0.02em]">
            Cloth first.
            <br />
            <em>Then</em> the cut.
          </h1>
          <p className="max-w-[600px] text-[17px] leading-[1.6] text-ink-2 md:text-[19px]">{story.opening}</p>
        </div>
        <div className="relative aspect-[4/5] max-h-[640px] w-full min-w-0 flex-[4_1_320px] overflow-hidden bg-[#4A3F3A]">
          {portrait && (
            <Image
              src={portrait.url}
              alt={portrait.altText ?? ""}
              fill
              preload
              sizes="(min-width: 768px) 35vw, 100vw"
              className="object-cover"
            />
          )}
        </div>
      </section>

      <section
        aria-label="What we believe"
        className="page-x grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-x-12 gap-y-10 pb-20 md:pb-[120px]"
      >
        {BELIEFS.map((belief, i) => (
          <div key={belief.title} className="flex flex-col gap-3.5 border-t border-ink pt-5">
            <span className="text-[12px] tracking-[0.12em] text-ink-2">{String(i + 1).padStart(2, "0")}</span>
            <h2 className="font-display text-[28px] leading-[1.1] md:text-[32px]">{belief.title}</h2>
            <p className="max-w-[380px] leading-[1.6] text-ink-2">{belief.body}</p>
          </div>
        ))}
      </section>

      {workshop && (
        <section aria-label="Workshop" className="page-x pb-20 md:pb-[120px]">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#2B3049] md:aspect-[21/9]">
            <Image src={workshop.url} alt={workshop.altText ?? ""} fill sizes="100vw" className="object-cover" />
          </div>
        </section>
      )}

      <section aria-label="From the founder" className="bg-ink text-paper">
        <figure className="mx-auto flex max-w-[1100px] flex-col gap-8 px-[clamp(16px,4vw,48px)] py-20 md:py-[120px]">
          <blockquote className="font-display text-[clamp(28px,3.6vw,52px)] leading-[1.2] italic">“{story.quote}”</blockquote>
          <figcaption className="text-[13px] tracking-[0.14em] text-night-text uppercase">{story.founder}, founder</figcaption>
        </figure>
      </section>

      {cloths.length > 0 && (
        <section aria-labelledby="start" className="page-x flex flex-wrap items-end justify-between gap-x-16 gap-y-8 py-20 md:py-[120px]">
          <div className="flex max-w-[560px] flex-[1_1_420px] flex-col gap-4">
            <h2 id="start" className="font-display text-[clamp(40px,4vw,56px)] leading-[1.05] tracking-[-0.01em]">
              Start with the <em>cloth</em>
            </h2>
            <p className="leading-[1.6] text-ink-2">Each cloth has its own technique and history.</p>
          </div>
          <nav aria-label="Shop by cloth" className="flex flex-[1_1_480px] flex-wrap gap-2">
            {cloths.map((cloth) => (
              <Link
                key={cloth.key}
                href={cloth.href}
                className="inline-flex h-12 items-center border border-ink px-5 text-[15px] no-underline hover:bg-ink hover:text-paper"
              >
                {cloth.name}
              </Link>
            ))}
          </nav>
        </section>
      )}
    </>
  );
}
