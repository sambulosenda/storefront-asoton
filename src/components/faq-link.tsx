import Link from "next/link";
import { SizeGuideLink } from "@/components/size-guide";

/** A link under an FAQ answer. The size guide is a dialog, so that one opens in place. */
export function FaqLink({ href, label }: { href: string; label: string }) {
  const className = "self-start text-ink underline-offset-4";
  if (href === "/help#size-guide") return <SizeGuideLink className={className}>{label}</SizeGuideLink>;
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
