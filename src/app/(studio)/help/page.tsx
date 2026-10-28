import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { HelpNav } from "@/components/help-nav";
import { deliveryThreshold, deliveryTimes } from "@/lib/catalog";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Help",
  description: `Sizes, delivery, returns, care and how to reach ${site.brand}.`,
  alternates: { canonical: "/help" },
};

const CARE = [
  {
    cloth: "Ankara and dashiki prints",
    text: "Wash cold on a gentle cycle, inside out, with similar colours. Iron on the reverse while slightly damp.",
  },
  { cloth: "Kente prints", text: "Wash cold, inside out, and dry in the shade so the colours stay bright. Iron on the reverse." },
  {
    cloth: "Embroidered pieces",
    text: "Dry clean, or a brief cold hand wash. Iron on the reverse, never over the embroidery.",
  },
];

const RETURN_STEPS = [
  { title: "Start your return", text: "Use your order number and email to choose what you’re sending back." },
  { title: "Pack it up", text: "Unworn, with tags attached, in the original packaging if you still have it." },
  { title: "Drop it off", text: `We refund to your original payment within ${site.refundDays} days of receiving it.` },
];

const h2 = "font-display text-[36px] leading-[1.05] md:text-[44px]";
const th = "label-caps border-b border-ink pb-2.5 text-left";

export default async function HelpPage() {
  const [times, threshold] = await Promise.all([deliveryTimes(), deliveryThreshold()]);
  // Shopify's delivery rules fill in the times; costs stay placeholders until they're set here.
  const deliveryRates = [
    { service: "UK standard", arrives: times.uk, cost: `£[X.XX], free over ${threshold.label}` },
    {
      service: "UK next day",
      arrives: times.cutoff ? `Order by ${times.cutoff}, Monday to Thursday` : "Order by [TIME], Monday to Thursday",
      cost: "£[X.XX]",
    },
    { service: "International", arrives: times.international ?? "[X]–[X] working days", cost: "Shown at checkout" },
  ];
  return (
    <div className="page-x pt-12 pb-20 md:pt-[72px] md:pb-[120px]">
      <div className="flex flex-col gap-5 border-b border-ink pb-10 md:pb-14">
        <span className="eyebrow">Help</span>
        <h1 className="font-display text-[clamp(48px,6vw,88px)] leading-[0.95] tracking-[-0.02em]">How can we help?</h1>
        <p className="max-w-[560px] text-[17px] leading-[1.6] text-ink-2">
          Delivery, returns, care and how to reach us. If you can’t find an answer, write to{" "}
          <a href={`mailto:${site.email}`} className="underline-offset-4">
            {site.email}
          </a>
          .
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-x-24 gap-y-12 pt-10 md:pt-14">
        <HelpNav />

        <div className="flex max-w-[820px] min-w-0 flex-[999_1_560px] flex-col gap-20 md:gap-24">
          <section id="delivery" aria-labelledby="h-delivery" className="flex scroll-mt-6 flex-col gap-5">
            <h2 id="h-delivery" className={h2}>
              Delivery
            </h2>
            <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Delivery options">
              <table className="w-full min-w-[520px] border-collapse text-[15px]">
                <thead>
                  <tr>
                    <th scope="col" className={`${th} pr-4`}>
                      Service
                    </th>
                    <th scope="col" className={`${th} pr-4`}>
                      Arrives
                    </th>
                    <th scope="col" className={th}>
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryRates.map((rate) => (
                    <tr key={rate.service}>
                      <th scope="row" className="border-b border-line py-4 pr-4 text-left font-medium">
                        {rate.service}
                      </th>
                      <td className="border-b border-line py-4 pr-4">{rate.arrives}</td>
                      <td className="border-b border-line py-4">{rate.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[15px] leading-[1.6] text-ink-2">
              You’ll get a tracking link by email as soon as your order leaves us. International orders may pay import duties in the destination
              country.
            </p>
          </section>

          <section id="returns" aria-labelledby="h-returns" className="flex scroll-mt-6 flex-col gap-6">
            <h2 id="h-returns" className={h2}>
              Returns
            </h2>
            <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-6">
              {RETURN_STEPS.map((step, i) => (
                <li key={step.title} className="flex flex-col gap-2 border-t border-ink pt-4">
                  <span className="text-[12px] tracking-[0.12em] text-ink-2">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-medium">{step.title}</span>
                  <span className="text-[14px] leading-[1.55] text-ink-2">{step.text}</span>
                </li>
              ))}
            </ol>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-[15px] leading-[1.6] text-ink-2">
              <li>Return ready-to-ship pieces within {site.returnDays} days of delivery.</li>
              <li>Made-to-order pieces are made to your size, so we can only take them back if they’re faulty.</li>
              <li>Cut-to-length fabric: [your policy].</li>
              <li>
                Faulty or wrong item?{" "}
                <a href="#contact" className="underline-offset-4">
                  Contact us
                </a>{" "}
                first and we’ll sort it.
              </li>
            </ul>
            <a href="#contact" className="btn btn-ink self-start">
              Start a return
            </a>
          </section>

          <section id="care" aria-labelledby="h-care" className="flex scroll-mt-6 flex-col gap-5">
            <h2 id="h-care" className={h2}>
              Caring for the cloth
            </h2>
            <dl className="border-t border-ink">
              {CARE.map((c) => (
                <div key={c.cloth} className="flex flex-col gap-2 border-b border-line py-5 md:grid md:grid-cols-[200px_minmax(0,1fr)] md:gap-6">
                  <dt className="font-display text-[22px] leading-[1.2]">{c.cloth}</dt>
                  <dd className="text-[15px] leading-[1.6] text-ink-2">{c.text}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="contact" aria-labelledby="h-contact" className="flex scroll-mt-6 flex-col gap-6">
            <h2 id="h-contact" className={h2}>
              Contact us
            </h2>
            <div className="flex flex-wrap gap-x-16 gap-y-10">
              <ContactForm />
              <div className="flex flex-[2_1_220px] flex-col gap-5 text-[15px] leading-[1.6]">
                <div>
                  <span className="label-caps block">Email</span>
                  <a href={`mailto:${site.email}`} className="underline-offset-4">
                    {site.email}
                  </a>
                </div>
                <div>
                  <span className="label-caps block">Hours</span>
                  <span className="text-ink-2">Monday to Friday, {site.hours}</span>
                </div>
                <div>
                  <span className="label-caps block">Reply time</span>
                  <span className="text-ink-2">Within {site.replyDays} working days</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
