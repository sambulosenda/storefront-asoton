import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPolicy, policyHandles, type PolicyHandle } from "@/lib/shopify";
import { site } from "@/lib/site";

const isPolicy = (handle: string): handle is PolicyHandle => (policyHandles as string[]).includes(handle);

export function generateStaticParams() {
  return policyHandles.map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: PageProps<"/policies/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const policy = isPolicy(handle) ? await getPolicy(handle) : null;
  if (!policy) notFound();
  return {
    title: policy.title,
    description: `${site.brand}'s ${policy.title.toLowerCase()}.`,
    alternates: { canonical: `/policies/${handle}` },
  };
}

export default async function PolicyPage({ params }: PageProps<"/policies/[handle]">) {
  const { handle } = await params;
  const policy = isPolicy(handle) ? await getPolicy(handle) : null;
  if (!policy) notFound();

  return (
    <article className="page-x pt-12 pb-20 md:pt-[72px] md:pb-[120px]">
      <h1 className="border-b border-ink pb-10 font-display text-[clamp(44px,5vw,72px)] leading-[0.95] tracking-[-0.02em] md:pb-14">
        {policy.title}
      </h1>
      <div
        className="max-w-[720px] pt-10 text-[16px] leading-[1.7] text-ink-2 [&_a]:underline [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-[28px] [&_h2]:text-ink [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:font-medium [&_h3]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4 [&_strong]:text-ink"
        dangerouslySetInnerHTML={{ __html: policy.body }}
      />
    </article>
  );
}
