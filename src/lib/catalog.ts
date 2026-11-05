// Store navigation and the cloth list, from Shopify when set up there and from the
// design's defaults otherwise.

import { CLOTHS, clothByName, clothOf, type Cloth } from "@/lib/cloths";
import { formatMoney } from "@/lib/format";
import {
  getCampaign,
  getCloths,
  getCollection,
  getCollectionOrAll,
  getDeliveryRules,
  getFreeDeliveryThreshold,
  getHomeCampaign,
  getMenu,
  getOccasions,
  searchProducts,
  type Image,
  type MenuLink,
  type Product,
} from "@/lib/shopify";
import { collections, departmentNames, departmentOf, departments, site, type Department } from "@/lib/site";

const search = (q: string) => `/search?q=${encodeURIComponent(q)}`;

/**
 * Fallback sub-categories, used until "women", "men" and "kids" menus exist in Shopify (Content →
 * Menus). Each links to one of the store's own collections.
 */
const DEFAULT_MENUS: Record<Department, MenuLink[]> = {
  women: [
    { title: "Dresses", href: "/collections/dresses" },
    { title: "Two-piece sets", href: "/collections/suits-2-piece-sets" },
    { title: "Co-ords & jumpsuits", href: "/collections/co-ords-jumpsuits" },
    { title: "Tops", href: "/collections/tops-womens-clothing" },
    { title: "Kimonos & capes", href: "/collections/weaved-kimono-and-cape" },
    { title: "Skirts", href: "/collections/skirts" },
    { title: "Trousers", href: "/collections/ladies-trousers-pants" },
    { title: "Jackets & coats", href: "/collections/jackets-coats" },
    { title: "Dashiki", href: "/collections/women-dashiki" },
  ],
  men: [
    { title: "Suits", href: "/collections/embroidery" },
    { title: "Shirts", href: "/collections/shirts-mens-clothing" },
    { title: "Dashiki", href: "/collections/dashiki" },
    { title: "Blazers", href: "/collections/african-print-blazers" },
    { title: "Jackets", href: "/collections/jackets" },
    { title: "Trousers", href: "/collections/trousers-pants" },
  ],
  kids: [
    { title: "Girls", href: "/collections/girls" },
    { title: "Boys", href: "/collections/boys" },
  ],
};

export async function departmentMenu(dept: Department): Promise<MenuLink[]> {
  const links = await getMenu(dept);
  return links.length > 0 ? links : DEFAULT_MENUS[dept];
}

/**
 * The department a sub-category sits under: the one whose menu links to it, else the one its
 * handle starts with (women-…, men-…). Undefined for the department collections themselves.
 */
export async function parentDepartment(handle: string): Promise<Department | undefined> {
  if (departmentOf(handle)) return undefined;
  const depts = Object.keys(departmentNames) as Department[];
  const menus = await Promise.all(depts.map((d) => departmentMenu(d)));
  const path = `/collections/${handle}`;
  return depts.find((_, i) => menus[i].some((link) => link.href === path)) ?? handle.match(/^(women|men)-/)?.[1] as Department | undefined;
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
 * another campaign entry), and the first pieces in New in (the new-in collection in its own
 * order, or the newest products when that collection doesn't exist). African pieces with a photo
 * come first, so the hero never leads with a plain knit jumper that happens to be newest.
 */
export async function homeFeature() {
  const [campaign, newIn] = await Promise.all([getHomeCampaign(), getCollectionOrAll({ handle: collections.newIn, first: 24 })]);
  // African pieces with a photo, then other pieces with a photo, then the rest; New in's order within each.
  const rank = (p: Product) => (p.featuredImage ? (isAfricanPiece(p) ? 0 : 1) : 2);
  const products = [...newIn.products].sort((x, y) => rank(x) - rank(y)).slice(0, 4);
  return { campaign, collection: newIn.collection, products };
}

const firstPhoto = (products: Product[]) => products.find((p) => p.featuredImage)?.featuredImage ?? null;

// Words that mark a piece as African clothing, beyond the cloth names clothOf() knows.
const AFRICAN = /\b(african|afro|ankara|kente|dashiki|adire|bogolan|bògòlan|aso[- ]?oke|wax print|kitenge|chitenge|fugu|batakari|smock|agbada|kaftan|boubou|buba|gele|heritage)\b/i;

/**
 * Whether a product's name says it's African clothing. Tags aren't used: the store tags plain
 * knit tops with shop-wide words like "African clothing London" too.
 */
export function isAfricanPiece(product: Product): boolean {
  return clothOf({ title: product.title }) !== null || AFRICAN.test(`${product.title} ${product.productType}`);
}

/**
 * The picture on a department tile. A "campaign" entry with the department's handle ("women",
 * "men") sets it when it has a photo; otherwise it's the first African piece in the collection
 * with a photo, else its first photo of any kind. The collection's own image is skipped: on this
 * store it's a theme demo photo (a fur coat, a puffer) rather than the shop's clothes.
 * Until the collection exists, the first photo the department's search word finds.
 */
export async function departmentImage(dept: Department): Promise<Image | null> {
  const handle = collections[dept];
  const [campaign, page] = await Promise.all([getCampaign(dept), getCollection({ handle, first: 24 })]);
  if (campaign?.image) return campaign.image;
  if (page) {
    const african = page.products.find((p) => p.featuredImage && isAfricanPiece(p));
    return african?.featuredImage ?? firstPhoto(page.products);
  }
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

/** The store's occasions that have pieces in them, so an empty one (such as Church, for now) isn't offered. */
export async function stockedOccasions() {
  const occasions = await getOccasions();
  const stocked = await Promise.all(
    occasions.map(async (o) => !o.collection || ((await getCollection({ handle: o.collection, first: 1 }))?.products.length ?? 0) > 0),
  );
  return occasions.filter((_, i) => stocked[i]);
}

/**
 * The cloths for the menu: every "cloth" entry in Shopify with a collection (Ankara, Kente, Dashiki,
 * Embroidered), else the design cloths the store has pieces in.
 */
export async function menuCloths(): Promise<MenuLink[]> {
  const entries = (await getCloths()).filter((e) => e.collectionHandle);
  if (entries.length > 0) return entries.map((e) => ({ title: e.name, href: `/collections/${e.collectionHandle}` }));
  return (await stockedCloths()).map((c) => ({ title: c.name, href: c.href }));
}
