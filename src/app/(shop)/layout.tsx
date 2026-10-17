import { Footer } from "@/components/footer";
import { AnnouncementBar, Header } from "@/components/header";
import { deliveryThreshold } from "@/lib/catalog";
import { accountUrl } from "@/lib/shopify";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const threshold = await deliveryThreshold();
  return (
    <>
      <AnnouncementBar threshold={threshold.label} />
      <Header accountUrl={accountUrl} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
