import type { Metadata } from "next";
import { Bodoni_Moda, Hanken_Grotesk } from "next/font/google";
import { CartDrawer } from "@/components/cart-drawer";
import { ClothPatterns } from "@/components/cloth";
import { CookieConsent } from "@/components/cookie-consent";
import { MarketSheet } from "@/components/market-selector";
import { MobileMenu, type MenuRow } from "@/components/mobile-menu";
import { SearchOverlay } from "@/components/search-overlay";
import { SizeGuide } from "@/components/size-guide";
import { StoreProvider } from "@/components/store-provider";
import { deliveryThreshold, departmentMenu, homeFeature, menuCloths, stockedOccasions } from "@/lib/catalog";
import { accountUrl, getMarkets } from "@/lib/shopify";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: site.brand, template: `%s · ${site.brand}` },
  description: site.description,
  openGraph: { siteName: site.brand, type: "website", locale: "en_GB" },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [threshold, women, men, cloths, occasions, markets, feature] = await Promise.all([
    deliveryThreshold(),
    departmentMenu("women"),
    departmentMenu("men"),
    menuCloths(),
    stockedOccasions(),
    getMarkets(),
    homeFeature(),
  ]);
  // The menu's promo tile follows the home hero: the campaign if there is one, else the newest piece.
  const [newest] = feature.products;
  const promo = feature.campaign?.headline
    ? {
        label: feature.campaign.label ?? "New in",
        title: feature.campaign.headline,
        href: "/collections/new-in",
        image: feature.campaign.image ?? newest?.featuredImage ?? null,
      }
    : newest
      ? { label: "New in", title: newest.title, href: `/products/${newest.handle}`, image: newest.featuredImage }
      : null;
  // In the design's order: the departments, the single links, then occasions and cloths.
  const menuRows: MenuRow[] = [
    { label: "Women", links: [{ title: "All women", href: "/collections/women" }, ...women] },
    { label: "Men", links: [{ title: "All men", href: "/collections/men" }, ...men] },
    { label: "Kids", href: "/collections/kids" },
    { label: "New in", href: "/collections/new-in" },
    { label: "Accessories", href: "/collections/accessories" },
    {
      label: "Occasions",
      links: occasions.map((o) => ({ title: o.name, href: o.collection ? `/collections/${o.collection}` : `/search?q=${encodeURIComponent(o.name)}` })),
    },
    { label: "Shop by cloth", links: cloths },
  ];
  const rows = menuRows.filter((row) => !("links" in row) || row.links.length > 0);

  return (
    <html lang="en-GB" className={`${bodoni.variable} ${hanken.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <ClothPatterns />
        <StoreProvider markets={markets.countries} defaultMarket={markets.fallback}>
          {children}
          <CartDrawer threshold={threshold.amount} thresholdLabel={threshold.label} />
          <SearchOverlay />
          <MobileMenu rows={rows} accountUrl={accountUrl} promo={promo} />
          <SizeGuide />
          <MarketSheet />
        </StoreProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
