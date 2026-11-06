import type { Metadata } from "next";
import { FaqLink } from "@/components/faq-link";
import { breadcrumbs, JsonLd } from "@/components/json-ld";
import { PlusIcon } from "@/components/icons";
import { deliveryThreshold, deliveryTimes } from "@/lib/catalog";
import { collectionPath, site, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQs",
  description: `Answers to common questions about ordering, delivery, returns, sizes and made-to-order pieces at ${site.brand}.`,
  alternates: { canonical: "/faqs" },
};

/** One question. `answer` is plain text, so the same words go into the page and the FAQPage data. */
type Faq = { q: string; answer: string; link?: { label: string; href: string } };

export default async function FaqsPage() {
  const [times, threshold] = await Promise.all([deliveryTimes(), deliveryThreshold()]);
  const international = times.international ?? `${site.internationalDays} working days`;

  // Every answer follows site.ts, Shopify's delivery rules and the shop's policies. Keep them in step.
  const groups: { title: string; id: string; faqs: Faq[] }[] = [
    {
      title: "Ordering and payment",
      id: "ordering",
      faqs: [
        {
          q: "Which currency are your prices in?",
          answer:
            "Prices are in pounds sterling (GBP) and include UK VAT where it applies. If you choose another country or currency, the price is converted at checkout, and your bank may charge its own fees.",
        },
        {
          q: "Is it safe to pay on your website?",
          answer:
            "Yes. Checkout runs on Shopify, and your payment is taken securely by our payment providers. We never see or keep your full card details.",
        },
        {
          q: "Can I change or cancel my order?",
          answer: `Contact us as soon as you can and we’ll do our best before it leaves us. You can cancel most orders within 14 days of delivery. Made-to-order and custom-made pieces can’t be cancelled once we’ve started making them, unless they’re faulty.`,
          link: { label: "Read our terms", href: "/policies/terms-of-service" },
        },
        {
          q: "Will the piece look exactly like the photos?",
          answer:
            "Many of our pieces are made from printed and woven African cloth, so pattern placement, colour and finish can vary slightly from piece to piece and from the photos. Screens also show colours differently. These natural differences are not a fault.",
        },
      ],
    },
    {
      title: "Delivery",
      id: "delivery",
      faqs: [
        {
          q: "How long will my order take?",
          answer: `Ready-to-ship pieces leave us within ${times.dispatch}. UK delivery then usually takes ${times.uk}, and international delivery ${international}. Working days are Monday to Friday, not including UK bank holidays.`,
          link: { label: "Delivery details", href: "/help#delivery" },
        },
        {
          q: "How long do made-to-order pieces take?",
          answer:
            "Made-to-order and custom-made pieces are made to your size first, which usually takes about 14 days. Each piece shows its own making time when you choose it. If your order has ready-to-ship pieces too, we send everything together once it’s all ready, unless you ask us to split it.",
        },
        {
          q: "Do you offer free delivery?",
          answer: `Yes, standard UK delivery is free on orders over ${threshold.label}. Other delivery costs are shown at checkout before you pay.`,
        },
        {
          q: "Do you deliver outside the UK?",
          answer: `Yes, we deliver to many countries. International orders usually arrive ${international} after dispatch, and delivery costs are shown at checkout. Your country may charge import duties, taxes or customs fees, which are paid by you, and customs checks can add to delivery times.`,
        },
        {
          q: "How can I track my order?",
          answer: "You’ll get an email with a tracking link as soon as your order leaves us.",
        },
        {
          q: "My parcel hasn’t arrived or arrived damaged. What should I do?",
          answer: `Email ${site.email} or call ${site.phone} and we’ll take it up with the courier for you.`,
        },
      ],
    },
    {
      title: "Returns and refunds",
      id: "returns",
      faqs: [
        {
          q: "Can I return something?",
          answer: `Yes. You can return ready-to-ship pieces within ${site.returnDays} days of delivery. They must be unworn and unwashed, with the tags still attached, ideally in the original packaging.`,
          link: { label: "Read our refund policy", href: "/policies/refund-policy" },
        },
        {
          q: "Can I return a made-to-order or custom-made piece?",
          answer:
            "These pieces are cut and sewn to your size or your choices, so we can only take them back if they’re faulty or not what you ordered.",
        },
        {
          q: "Can I return a sale piece?",
          answer: `For a refund on a ready-to-ship sale piece, tell us within 14 days of delivery, then send it back within 14 days of telling us. After that, and up to ${site.returnDays} days from delivery, we can offer an exchange or store credit.`,
        },
        {
          q: "How do I send a return?",
          answer: `Email ${site.email} or use the contact form on our Help page with your order number and the pieces you’re sending back. Then send them, packed securely, to ${site.company}, ${site.address}, United Kingdom, by a tracked service. Unless the item is faulty or wrong, the cost of returning it is yours.`,
          link: { label: "Contact us", href: "/help#contact" },
        },
        {
          q: "When will I get my refund?",
          answer: `Once your return arrives and passes our checks, we refund your original payment method within ${site.refundDays} working days. Your bank or card provider may take a few more days to show it.`,
        },
        {
          q: "What if my item is faulty or wrong?",
          answer:
            "Contact us as soon as you can, ideally within 48 hours of delivery, with photos. We’ll put it right with a repair, replacement or refund, and we’ll cover the cost of sending it back.",
        },
      ],
    },
    {
      title: "Sizes, made-to-order and care",
      id: "sizes",
      faqs: [
        {
          q: "How do I find my size?",
          answer:
            "Sizes are shown in UK sizes, and each product page has a size guide. Please check it before you order. If you’re between sizes or unsure, contact us and we’ll help.",
          link: { label: "Open the size guide", href: "/help#size-guide" },
        },
        {
          q: "Can you make a piece in my size or to my choices?",
          answer:
            "Yes, pieces in our Custom made range are made to your size or your choices. They usually take about 14 days to make (each piece shows its own making time), and because they’re made for you, they can only be returned if they’re faulty.",
          link: { label: "Shop custom made", href: collectionPath("customMade") },
        },
        {
          q: "How do I care for African print clothing?",
          answer:
            "Wash Ankara, dashiki and kente prints cold, inside out, with similar colours, and iron on the reverse. Dry clean embroidered pieces, or give them a brief cold hand wash, and never iron over the embroidery.",
          link: { label: "Care guide", href: "/help#care" },
        },
      ],
    },
    {
      title: "About us",
      id: "about",
      faqs: [
        {
          q: "Who are you?",
          answer: `${site.name} is run by ${site.company}, a company in the United Kingdom. We sell contemporary African clothing for women, men and kids.`,
          link: { label: "Our story", href: "/story" },
        },
        {
          q: "Do you have a shop I can visit?",
          answer: `Our shop is at ${site.address}. Please call ${site.phone} before you visit to check we’re open.`,
        },
        {
          q: "How can I contact you?",
          answer: `Email ${site.email}, call ${site.phone}, or use the contact form on our Help page.`,
          link: { label: "Contact us", href: "/help#contact" },
        },
      ],
    },
  ];

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
        <nav aria-label="FAQ topics" className="flex flex-[0_1_220px] flex-col text-[15px] md:sticky md:top-6">
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
