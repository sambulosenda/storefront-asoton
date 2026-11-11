"use client";

import { useStore } from "@/components/store-provider";

const TOPICS = [
  { label: "Delivery", href: "#delivery" },
  { label: "Returns", href: "#returns" },
  { label: "Care", href: "#care" },
  { label: "Size guide", href: "#size-guide" },
  { label: "Contact", href: "#contact" },
  { label: "FAQs", href: "/faqs" },
];

export function HelpNav() {
  const { openSizeGuide } = useStore();
  return (
    <nav aria-label="Help topics" className="flex flex-[0_1_220px] flex-col text-[15px] md:sticky md:top-[calc(var(--header-h)+24px)] md:transition-[top] md:duration-(--duration-quick) md:ease-(--ease-out-soft)">
      {TOPICS.map((t) => (
        <a
          key={t.href}
          href={t.href}
          onClick={(e) => {
            if (t.href === "#size-guide") {
              e.preventDefault();
              openSizeGuide();
            }
          }}
          className="flex min-h-11 items-center border-b border-line no-underline"
        >
          {t.label}
        </a>
      ))}
    </nav>
  );
}
