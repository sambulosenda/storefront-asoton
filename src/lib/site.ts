// Shop-wide copy and settings. Contact details, delivery times and the returns policy follow
// the shop's current site, africanclothingstore.co.uk, which this storefront replaces.

/** The public address of the shop, for the sitemap and links shared elsewhere. Set SITE_URL in production. */
export const siteUrl = (
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

export const site = {
  brand: "African Clothing Store",
  /** The company behind the shop, for the footer and the Our story page. */
  company: "JT Aphrique Ltd.",
  tagline: "Contemporary African clothing for women, men and kids.",
  description:
    "Contemporary African clothing for women, men and kids, in Ankara, kente and dashiki prints and embroidered cloth.",
  market: "United Kingdom · GBP £",
  /** Used when the shop metafield custom.free_delivery_threshold isn't set. */
  freeDeliveryThreshold: "£100",
  /** Ready-to-ship pieces. Made-to-order pieces take 7 to 10 working days before they're sent. */
  dispatchDays: "2 to 4",
  /** UK delivery once dispatched, by priority courier. */
  deliveryDays: "2 to 4",
  internationalDays: "5 to 8",
  /** Ready-to-ship pieces only: made-to-order pieces come back only when faulty. */
  returnDays: "30",
  email: "sales@africanclothingstore.co.uk",
  phone: "+44 1438 211744",
  address: "Unit 41, The Mall, Luton LU1 2TD",
  /** Working days to refund once a return arrives and passes its checks. */
  refundDays: "5 to 10",
  social: {
    instagram: "https://www.instagram.com/jtaphrique/",
    facebook: "https://www.facebook.com/jtaphrique",
    youtube: "https://www.youtube.com/@JTAPHRIQUEOFFICIAL",
    x: "https://x.com/jtaphrique",
  },
};

/**
 * The Shopify collection handles behind the shop's fixed links. Change a handle here when the
 * store names the collection differently: every menu, button and page that links to it follows.
 */
export const collections = {
  newIn: "new-arrivals",
  // The store's full ranges. Its "women" (102) and "men" (74) collections hold only part of them.
  women: "womens-clothing",
  men: "mens-all",
  kids: "kids",
  unisex: "unisex",
  accessories: "african-accessories",
  gifts: "gift",
  fabric: "fabric-lace",
  customMade: "custom-made-african-clothing",
};

/** The departments a collection can belong to, for breadcrumbs, category chips and the size guide. */
export type Department = "women" | "men" | "kids";
export const departmentNames: Record<Department, string> = { women: "Women", men: "Men", kids: "Kids" };

/** The department whose main collection this is, if any. */
export const departmentOf = (handle: string): Department | undefined =>
  (Object.keys(departmentNames) as Department[]).find((d) => collections[d] === handle);

/**
 * Collections left out of the sitemap: stand-ins for the old theme's home page, catch-alls that
 * hold the whole catalogue, and copies of other collections. They still open if someone has the link.
 */
export const unlistedCollections = [
  "frontpage",
  "frontpage-1",
  "front",
  "latest-products",
  "uncategorized",
  "other",
  "women",
  "men",
  "women1",
  "country-bracelet-1",
  "gifts-for-her-christmas",
  "gifts-for-him-christmas",
];

export const collectionPath = (key: keyof typeof collections) => `/collections/${collections[key]}`;

/** The header's links on desktop. */
export const nav = [
  { label: "New in", href: collectionPath("newIn") },
  { label: "Women", href: collectionPath("women") },
  { label: "Men", href: collectionPath("men") },
  { label: "Kids", href: collectionPath("kids") },
  { label: "Unisex", href: collectionPath("unisex") },
  { label: "Accessories", href: collectionPath("accessories") },
  { label: "Gifts", href: collectionPath("gifts") },
];

/** Shop links that only fit in the phone menu and the footer. */
export const moreNav = [
  { label: "Fabric & lace", href: collectionPath("fabric") },
  { label: "Custom made", href: collectionPath("customMade") },
];

export const footerNav = [
  {
    title: "Shop",
    links: [...nav, ...moreNav],
  },
  {
    title: "Help",
    links: [
      { label: "Size guide", href: "/help#size-guide" },
      { label: "Delivery", href: "/help#delivery" },
      { label: "Returns", href: "/help#returns" },
      { label: "Care guide", href: "/help#care" },
      { label: "Contact us", href: "/help#contact" },
    ],
  },
  {
    title: "Studio",
    links: [
      { label: "Our story", href: "/story" },
      { label: "Lookbook", href: "/lookbook" },
      { label: "Instagram", href: site.social.instagram },
      { label: "Facebook", href: site.social.facebook },
      { label: "YouTube", href: site.social.youtube },
    ],
  },
];

/**
 * Department pages, keyed by collection handle. The intro shows until the collection has a
 * description in Shopify. The editorial block between the product grids comes from the
 * "campaign" metaobject with the same handle; these set its colour and which side the picture sits.
 */
export const departments: Record<string, { intro: string; tone: string; imageFirst: boolean; imageSearch: string }> = {
  [collections.women]: {
    intro: "Dresses, sets, jumpsuits and kimonos in Ankara, kente and dashiki prints and embroidered cloth.",
    tone: "#2B3049",
    imageFirst: true,
    // Until the collection exists, the home page's tile shows the first product this search finds.
    imageSearch: "dress",
  },
  [collections.men]: {
    intro: "Suits, shirts, jackets and trousers in Ankara, kente and dashiki prints and embroidered cloth.",
    tone: "#2F3438",
    imageFirst: false,
    imageSearch: "kaftan",
  },
};

export const popularSearches = ["Ankara", "Dashiki", "Kente", "Maxi dress", "Embroidered suit", "Headwrap"];

/** Copy for the Our story page. The founder quote shows only once both fields are filled in. */
export const story = {
  opening: `${site.brand} (${site.company}) began in the UK in 2010, with a simple aim: to show the heritage, beauty and diversity of African design through African-inspired clothing. Today we make contemporary clothing for women, men and kids in Ankara, kente and dashiki prints and embroidered cloth.`,
  makers:
    "Every collection is made with skilled artisans, textile weavers and master tailors. We source good cottons, rich brocades and wax prints, and check every garment before it leaves us.",
  quote: "",
  founder: "",
};

/**
 * A collection's name for headings, menus and breadcrumbs. Departments go by their plain name
 * ("Men", not "Mens All Collection"), and SEO tails after " | " are dropped, so
 * "Earrings Collection | Handcrafted African Jewelry" reads "Earrings".
 */
export function collectionName(handle: string, title: string): string {
  const dept = departmentOf(handle);
  if (dept) return departmentNames[dept];
  return title.split(" | ")[0].replace(/\s+Collection$/i, "").trim() || title;
}
