import Link from "next/link";
import { ClothSwatch } from "@/components/cloth";
import { MinimalFooter } from "@/components/footer";
import { Header } from "@/components/header";
import { ArrowRight } from "@/components/icons";

export default function NotFound() {
  return (
    <>
      <Header accountUrl={null} minimal />
      <main className="page-x flex flex-1 flex-wrap items-center gap-x-24 gap-y-12 pt-12 pb-20 md:pt-[72px] md:pb-24">
        <div className="flex max-w-[560px] min-w-0 flex-[1_1_420px] flex-col gap-6">
          <span className="eyebrow">Error 404</span>
          <h1 className="font-display text-[clamp(44px,5vw,72px)] leading-none tracking-[-0.02em]">We can’t find that page</h1>
          <p className="text-[17px] leading-[1.6] text-ink-2">
            It may have moved, or the link may be mistyped. Try a search, or start from one of these.
          </p>
          <form action="/search" role="search" className="flex flex-col gap-2 pt-2">
            <label htmlFor="nf-search" className="text-[12px] tracking-[0.14em] text-ink-2 uppercase">
              Search the shop
            </label>
            <div className="flex items-center gap-3 border-b border-ink">
              <input
                id="nf-search"
                name="q"
                type="search"
                placeholder="Adire, kaftan, headwrap…"
                className="h-[52px] min-w-0 flex-1 bg-transparent placeholder:text-muted focus:outline-none"
              />
              <button type="submit" aria-label="Search" className="inline-flex size-11 cursor-pointer items-center justify-center">
                <ArrowRight />
              </button>
            </div>
          </form>
          <nav aria-label="Popular pages" className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-[15px]">
            {[
              { label: "New in", href: "/collections/new-in" },
              { label: "Women", href: "/collections/women" },
              { label: "Men", href: "/collections/men" },
              { label: "Help", href: "/help" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="py-2.5 underline-offset-[6px]">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div aria-hidden="true" className="aspect-[4/5] max-h-[560px] max-w-[520px] min-w-0 flex-[1_1_360px] overflow-hidden bg-[#2E2219]">
          <ClothSwatch cloth="bogolan" />
        </div>
      </main>
      <MinimalFooter />
    </>
  );
}
