// The shop's questions and answers. The FAQs page shows them and the shop assistant answers from
// them (src/lib/assistant), so the two can't disagree.

import { deliveryThreshold, deliveryTimes } from "@/lib/catalog";
import { collectionPath, site } from "@/lib/site";

/** One question. `answer` is plain text, so the same words go into the page and the FAQPage data. */
export type Faq = { q: string; answer: string; link?: { label: string; href: string } };
export type FaqGroup = { title: string; id: string; faqs: Faq[] };

export async function faqGroups(): Promise<FaqGroup[]> {
  const [times, threshold] = await Promise.all([deliveryTimes(), deliveryThreshold()]);
  const international = times.international ?? `${site.internationalDays} working days`;

  // Every answer follows site.ts, Shopify's delivery rules and the shop's policies. Keep them in step.
  return [
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
}
