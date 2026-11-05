"use client";

import Link from "next/link";
import { useStore } from "@/components/store-provider";

/** A link under an FAQ answer. The size guide is a dialog, so that one opens in place. */
export function FaqLink({ href, label }: { href: string; label: string }) {
  const { openSizeGuide } = useStore();
  const className = "self-start text-ink underline-offset-4";
  if (href === "/help#size-guide") {
    return (
      <button type="button" onClick={() => openSizeGuide()} className={`${className} cursor-pointer text-left underline`}>
        {label}
      </button>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
