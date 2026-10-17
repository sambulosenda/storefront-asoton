"use client";

import { useStore } from "@/components/store-provider";

const TOPICS = [
  { label: "Delivery", href: "#delivery" },
  { label: "Returns", href: "#returns" },
  { label: "Care", href: "#care" },
  { label: "Size guide", href: "#size-guide" },
  { label: "Contact", href: "#contact" },
];

export function HelpNav() {
  const { openSizeGuide } = useStore();
  return (
    <nav aria-label="Help topics" className="flex flex-[0_1_220px] flex-col text-[15px] md:sticky md:top-6">
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
