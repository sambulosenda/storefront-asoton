import type { Metadata } from "next";
import { Bodoni_Moda, Hanken_Grotesk } from "next/font/google";
import { CartDrawer } from "@/components/cart-drawer";
import { ClothPatterns } from "@/components/cloth";
import { CookieConsent } from "@/components/cookie-consent";
import { MobileMenu } from "@/components/mobile-menu";
import { SearchOverlay } from "@/components/search-overlay";
import { SizeGuide } from "@/components/size-guide";
import { StoreProvider } from "@/components/store-provider";
import { clothLinks, deliveryThreshold, departmentMenu } from "@/lib/catalog";
import { accountUrl } from "@/lib/shopify";
import { site } from "@/lib/site";
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
  title: { default: site.brand, template: `%s · ${site.brand}` },
  description: site.description,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [threshold, women, men, cloths] = await Promise.all([
    deliveryThreshold(),
    departmentMenu("women"),
    departmentMenu("men"),
    clothLinks(),
  ]);
  const menuGroups = [
    { label: "Women", links: [{ title: "All women", href: "/collections/women" }, ...women] },
    { label: "Men", links: [{ title: "All men", href: "/collections/men" }, ...men] },
    { label: "Shop by cloth", links: cloths.map((c) => ({ title: c.name, href: c.href })) },
  ];

  return (
    <html lang="en-GB" className={`${bodoni.variable} ${hanken.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <ClothPatterns />
        <StoreProvider>
          {children}
          <CartDrawer threshold={threshold.amount} thresholdLabel={threshold.label} />
          <SearchOverlay />
          <MobileMenu groups={menuGroups} accountUrl={accountUrl} />
          <SizeGuide />
        </StoreProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
