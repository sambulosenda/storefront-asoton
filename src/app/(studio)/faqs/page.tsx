import type { Metadata } from "next";
import { FaqLink } from "@/components/faq-link";
import { breadcrumbs, JsonLd } from "@/components/json-ld";
import { PlusIcon } from "@/components/icons";
import { faqGroups } from "@/lib/faqs";
import { site, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQs",
  description: `Answers to common questions about ordering, delivery, returns, sizes and made-to-order pieces at ${site.brand}.`,
  alternates: { canonical: "/faqs" },
};

export default async function FaqsPage() {
  const groups = await faqGroups();

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) =>
      g.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
    ),
  };

  return (
    <div className="page-x pt-12 pb-20 md:pt-[72px] md:pb-[120px]">
      <JsonLd data={faqData} />
      <JsonLd
        data={breadcrumbs(siteUrl, [
          { name: "Home", path: "/" },
          { name: "Help", path: "/help" },
          { name: "FAQs", path: "/faqs" },
        ])}
      />
      <div className="flex flex-col gap-5 border-b border-ink pb-10 md:pb-14">
        <span className="eyebrow">Help</span>
        <h1 className="font-display text-[clamp(48px,6vw,88px)] leading-[0.95] tracking-[-0.02em]">Questions and answers</h1>
        <p className="max-w-[560px] text-[17px] leading-[1.6] text-ink-2">
          Ordering, delivery, returns, sizes and made-to-order pieces. If your question isn’t here, write to{" "}
          <a href={`mailto:${site.email}`} className="underline-offset-4">
            {site.email}
          </a>{" "}
          or call{" "}
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="underline-offset-4">
            {site.phone}
          </a>
          .
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-x-24 gap-y-12 pt-10 md:pt-14">
        <nav aria-label="FAQ topics" className="flex flex-[0_1_220px] flex-col text-[15px] md:sticky md:top-[calc(var(--header-h)+24px)] md:transition-[top] md:duration-(--duration-quick) md:ease-(--ease-out-soft)">
          {groups.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="flex min-h-11 items-center border-b border-line no-underline">
              {g.title}
            </a>
          ))}
        </nav>

        <div className="flex max-w-[820px] min-w-0 flex-[999_1_560px] flex-col gap-16 md:gap-20">
          {groups.map((g) => (
            <section key={g.id} id={g.id} aria-labelledby={`h-${g.id}`} className="flex scroll-mt-6 flex-col gap-5">
              <h2 id={`h-${g.id}`} className="font-display text-[36px] leading-[1.05] md:text-[44px]">
                {g.title}
              </h2>
              <div className="border-t border-ink">
                {g.faqs.map((f) => (
                  <details key={f.q} className="group border-b border-line">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-left text-[16px] font-medium md:min-h-[60px] [&::-webkit-details-marker]:hidden">
                      <h3>{f.q}</h3>
                      <PlusIcon size={18} className="shrink-0 transition-transform group-open:rotate-45" aria-hidden="true" />
                    </summary>
                    <div className="flex max-w-[640px] flex-col gap-3 pb-6 text-[15px] leading-[1.65] text-ink-2">
                      <p>{f.answer}</p>
                      {f.link && <FaqLink href={f.link.href} label={f.link.label} />}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
