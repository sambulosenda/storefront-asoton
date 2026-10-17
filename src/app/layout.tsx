import type { Metadata } from "next";
import { Bodoni_Moda, Hanken_Grotesk } from "next/font/google";
import { CartDrawer } from "@/components/cart-drawer";
import { ClothPatterns } from "@/components/cloth";
import { CookieConsent } from "@/components/cookie-consent";
import { MarketSheet } from "@/components/market-selector";
import { MobileMenu } from "@/components/mobile-menu";
import { SearchOverlay } from "@/components/search-overlay";
import { SizeGuide } from "@/components/size-guide";
import { StoreProvider } from "@/components/store-provider";
import { clothLinks, deliveryThreshold, departmentMenu, homeFeature } from "@/lib/catalog";
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
  const [threshold, women, men, cloths, markets, feature] = await Promise.all([
    deliveryThreshold(),
    departmentMenu("women"),
    departmentMenu("men"),
    clothLinks(),
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
  const menuGroups = [
    { label: "Women", links: [{ title: "All women", href: "/collections/women" }, ...women] },
    { label: "Men", links: [{ title: "All men", href: "/collections/men" }, ...men] },
    { label: "Shop by cloth", links: cloths.map((c) => ({ title: c.name, href: c.href })) },
  ];

  return (
    <html lang="en-GB" className={`${bodoni.variable} ${hanken.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <ClothPatterns />
        <StoreProvider markets={markets.countries} defaultMarket={markets.fallback}>
          {children}
          <CartDrawer threshold={threshold.amount} thresholdLabel={threshold.label} />
          <SearchOverlay />
          <MobileMenu groups={menuGroups} accountUrl={accountUrl} promo={promo} />
          <SizeGuide />
          <MarketSheet />
        </StoreProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
