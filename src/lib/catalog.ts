// Store navigation and the cloth list, from Shopify when set up there and from the
// design's defaults otherwise.

import { CLOTHS, clothByName, clothOf, type Cloth } from "@/lib/cloths";
import { formatMoney } from "@/lib/format";
import {
  getCloths,
  getCollection,
  getCollectionOrAll,
  getDeliveryRules,
  getFreeDeliveryThreshold,
  getHomeCampaign,
  getMenu,
  searchProducts,
  type Image,
  type MenuLink,
  type Product,
} from "@/lib/shopify";
import { departments, site } from "@/lib/site";

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

export type ClothLink = Cloth & { collection: string | null; href: string };

/** The five cloths, linked to their collection when the "cloth" metaobject names one. */
export async function clothLinks(): Promise<ClothLink[]> {
  const entries = await getCloths();
  return CLOTHS.map((cloth) => {
    const entry = entries.find((e) => clothByName(e.name)?.key === cloth.key);
    const collection = entry?.collectionHandle ?? null;
    return {
      ...cloth,
      // The store's own name for it, such as "Ankara" for wax print.
      name: entry?.name ?? cloth.name,
      shop: entry?.name ? `Shop ${entry.name}` : cloth.shop,
      technique: entry?.technique ?? cloth.technique,
      origin: entry?.origin ?? cloth.origin,
      caption: entry?.caption ?? cloth.caption,
      collection,
      href: collection ? `/collections/${collection}` : search(cloth.query),
    };
  });
}

export type StockedCloth = ClothLink & { product: Product };

/**
 * The cloths the store has pieces in, each with one piece to show for it (the first with a photo):
 * from the cloth's collection when it has one, else from the products its search word finds.
 * Cloths with no pieces are left out.
 */
export async function stockedCloths(): Promise<StockedCloth[]> {
  const cloths = await clothLinks();
  const pieces = await Promise.all(
    cloths.map(async (cloth) => {
      const products = cloth.collection
        ? ((await getCollection({ handle: cloth.collection, first: 8 }))?.products ?? [])
        : // Search matches loosely, so keep only pieces that are this cloth.
          (await searchProducts({ query: cloth.query, first: 8 })).products.filter((p) => clothOf(p)?.key === cloth.key);
      return products.find((p) => p.featuredImage) ?? products[0] ?? null;
    }),
  );
  return cloths.flatMap((cloth, i) => {
    const product = pieces[i];
    return product ? [{ ...cloth, product }] : [];
  });
}

/**
 * What the home hero and the menu's promo lead with: the home campaign (the "home" entry, else
 * another campaign entry), and the first two pieces in New in (the new-in collection in its
 * own order, or the newest products when that collection doesn't exist).
 */
export async function homeFeature() {
  const [campaign, newIn] = await Promise.all([getHomeCampaign(), getCollectionOrAll({ handle: "new-in", first: 2 })]);
  return { campaign, collection: newIn.collection, products: newIn.products };
}

const firstPhoto = (products: Product[]) => products.find((p) => p.featuredImage)?.featuredImage ?? null;

/**
 * The picture on a department tile: the collection's own image, else its first product photo.
 * Until the collection exists, the first photo the department's search word finds.
 */
export async function departmentImage(handle: string): Promise<Image | null> {
  const page = await getCollection({ handle, first: 4 });
  if (page) return page.collection?.image ?? firstPhoto(page.products);
  const search = departments[handle]?.imageSearch;
  return search ? firstPhoto((await searchProducts({ query: search, first: 4 })).products) : null;
}

/** The free UK delivery amount: the shop metafield, else the "delivery_rules" entry, else the placeholder. */
export async function deliveryThreshold() {
  const [metafield, rules] = await Promise.all([getFreeDeliveryThreshold(), getDeliveryRules()]);
  const amount = metafield ?? rules?.freeOver ?? null;
  return {
    amount,
    label: amount ? formatMoney({ amount: String(amount), currencyCode: "GBP" }) : site.freeDeliveryThreshold,
  };
}

const workingDays = (n: number) => `${n} working ${n === 1 ? "day" : "days"}`;

/**
 * Dispatch and delivery times for the copy, from the "delivery_rules" entry in Shopify, with the
 * placeholders in site.ts until it exists.
 */
export async function deliveryTimes() {
  const rules = await getDeliveryRules();
  const dispatchDays = rules?.dispatchDays ?? null;
  return {
    /** "1 working day" */
    dispatch: dispatchDays !== null ? workingDays(dispatchDays) : `${site.dispatchDays} working days`,
    /** "Dispatched next working day" for one day, else "Dispatched within 3 working days". */
    dispatchLine:
      dispatchDays === 1
        ? "Dispatched next working day"
        : `Dispatched within ${dispatchDays !== null ? workingDays(dispatchDays) : `${site.dispatchDays} working days`}`,
    dispatchDays,
    /** UK standard delivery, such as "3 working days". */
    uk: rules?.ukStandardDays != null ? workingDays(rules.ukStandardDays) : `${site.deliveryDays} working days`,
    ukDays: rules?.ukStandardDays ?? null,
    express: rules?.ukExpressDays != null ? workingDays(rules.ukExpressDays) : null,
    international: rules?.internationalDays != null ? workingDays(rules.internationalDays) : null,
    cutoff: rules?.cutoff ?? null,
    holidays: rules?.holidays ?? [],
  };
}
