import type { Metadata } from "next";
import { Bodoni_Moda, Hanken_Grotesk } from "next/font/google";
import { Analytics } from "@/components/analytics";
import { CartDrawer } from "@/components/cart-drawer";
import { ClothPatterns } from "@/components/cloth";
import { CookieConsent } from "@/components/cookie-consent";
import { MarketSheet } from "@/components/market-selector";
import { MobileMenu } from "@/components/mobile-menu";
import { SearchOverlay } from "@/components/search-overlay";
import { SizeGuide } from "@/components/size-guide";
import { StoreProvider } from "@/components/store-provider";
import { deliveryPlan, deliveryThreshold, mainMenu, menuPromo } from "@/lib/catalog";
import { accountUrl, getMarkets } from "@/lib/shopify";
import { indexable, menuRows, site, siteUrl } from "@/lib/site";
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
  // Until the real address is set, this copy stays out of search results so it can't compete with the live shop.
  ...(indexable ? {} : { robots: { index: false, follow: false } }),
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [threshold, menu, markets, promo, plan] = await Promise.all([
    deliveryThreshold(),
    mainMenu(),
    getMarkets(),
    menuPromo(),
    deliveryPlan(),
  ]);

  return (
    <html lang="en-GB" className={`${bodoni.variable} ${hanken.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <ClothPatterns />
        <StoreProvider markets={markets.countries} defaultMarket={markets.fallback}>
          {children}
          <CartDrawer threshold={threshold.amount} thresholdLabel={threshold.label} delivery={plan} />
          <SearchOverlay />
          <MobileMenu rows={menuRows(menu)} accountUrl={accountUrl} promo={promo} />
          <SizeGuide />
          <MarketSheet />
        </StoreProvider>
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
