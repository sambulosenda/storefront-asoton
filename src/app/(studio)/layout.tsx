import { CompactFooter } from "@/components/footer";
import { AnnouncementBar, Header } from "@/components/header";
import { deliveryThreshold, mainMenu, menuPromo } from "@/lib/catalog";
import { accountUrl } from "@/lib/shopify";

/** Editorial pages (Lookbook, Help) close with the one-row footer. */
export default async function StudioLayout({ children }: LayoutProps<"/">) {
  const [threshold, menu, promo] = await Promise.all([deliveryThreshold(), mainMenu(), menuPromo()]);
  return (
    <>
      <AnnouncementBar threshold={threshold.label} />
      <Header accountUrl={accountUrl} menu={menu} promo={promo} />
      <main className="flex-1">{children}</main>
      <CompactFooter />
    </>
  );
}
