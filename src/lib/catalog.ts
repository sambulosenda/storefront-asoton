// Store navigation and the cloth list, from Shopify when set up there and from the
// design's defaults otherwise.

import { CLOTHS, clothByName, type Cloth } from "@/lib/cloths";
import { formatMoney } from "@/lib/format";
import { getCloths, getFreeDeliveryThreshold, getMenu, type MenuLink } from "@/lib/shopify";
import { site } from "@/lib/site";

const search = (q: string) => `/search?q=${encodeURIComponent(q)}`;

/** Fallback sub-categories, used until the "women" and "men" menus exist in Shopify. */
const DEFAULT_MENUS: Record<"women" | "men", MenuLink[]> = {
  women: [
    { title: "Dresses", href: search("dress") },
    { title: "Two-piece sets", href: search("two-piece") },
    { title: "Kaftans and boubous", href: search("boubou") },
    { title: "Tops and skirts", href: search("skirt") },
    { title: "Headwraps", href: search("headwrap") },
  ],
  men: [
    { title: "Kaftans", href: search("kaftan") },
    { title: "Agbada", href: search("agbada") },
    { title: "Shirts", href: search("shirt") },
    { title: "Trousers", href: search("trousers") },
    { title: "Sets", href: search("set") },
  ],
};

export async function departmentMenu(dept: "women" | "men"): Promise<MenuLink[]> {
  const links = await getMenu(dept);
  return links.length > 0 ? links : DEFAULT_MENUS[dept];
}

export type ClothLink = Cloth & { href: string };

/** The five cloths, linked to their collection when the "cloth" metaobject names one. */
export async function clothLinks(): Promise<ClothLink[]> {
  const entries = await getCloths();
  return CLOTHS.map((cloth) => {
    const entry = entries.find((e) => clothByName(e.name)?.key === cloth.key);
    return {
      ...cloth,
      technique: entry?.technique ?? cloth.technique,
      origin: entry?.origin ?? cloth.origin,
      caption: entry?.caption ?? cloth.caption,
      href: entry?.collectionHandle ? `/collections/${entry.collectionHandle}` : search(cloth.name),
    };
  });
}

export async function deliveryThreshold() {
  const amount = await getFreeDeliveryThreshold();
  return {
    amount,
    label: amount ? formatMoney({ amount: String(amount), currencyCode: "GBP" }) : site.freeDeliveryThreshold,
  };
}
