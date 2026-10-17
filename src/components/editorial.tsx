import Image from "next/image";
import Link from "next/link";
import type { Image as ShopifyImage } from "@/lib/shopify/types";

export type EditorialContent = {
  label: string | null;
  title: string;
  body: string | null;
  cta: string;
  href: string | null;
  image: ShopifyImage | null;
  tone: string;
  imageFirst: boolean;
};

/** The campaign block between the two product grids on a collection page. */
export function Editorial({ content }: { content: EditorialContent }) {
  const id = `edit-${content.title.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="page-x my-12 md:my-0 md:py-24">
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:gap-x-16 md:gap-y-10">
        <div
          style={{ backgroundColor: content.tone }}
          className={`relative h-56 min-w-0 overflow-hidden md:aspect-[16/10] md:h-auto md:flex-[3_1_480px] ${content.imageFirst ? "" : "md:order-2"}`}
        >
          {content.image && (
            <Image
              src={content.image.url}
              alt={content.image.altText ?? ""}
              fill
              sizes="(min-width: 768px) 55vw, 100vw"
              className="object-cover"
            />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-4 md:max-w-[480px] md:flex-[2_1_340px] md:items-start md:gap-5">
          {content.label && (
            <span className="text-[11px] tracking-[0.16em] text-ink-2 uppercase md:text-[12px]">{content.label}</span>
          )}
          <h2 id={id} className="font-display text-[32px] leading-[1.05] md:text-[clamp(36px,3.4vw,48px)] md:tracking-[-0.01em]">
            {content.title}
          </h2>
          {content.body && <p className="text-[15px] leading-[1.6] text-ink-2 md:text-[16px]">{content.body}</p>}
          {content.href && (
            <Link href={content.href} className="btn btn-outline md:mt-2">
              {content.cta}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
