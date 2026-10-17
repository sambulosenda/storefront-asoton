// Shop-wide copy and settings. Values in [BRACKETS] are placeholders from the design:
// replace them here once the real numbers are decided.

/** The public address of the shop, for the sitemap and links shared elsewhere. Set SITE_URL in production. */
export const siteUrl = (
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

export const site = {
  brand: "AsoTone",
  tagline: "Contemporary African clothing for women and men.",
  description:
    "Contemporary African clothing for women and men, cut from adire, kente, aso-oke, bògòlan and wax-print cloth.",
  market: "United Kingdom · GBP £",
  /** Used when the shop metafield custom.free_delivery_threshold isn't set. */
  freeDeliveryThreshold: "£[XX]",
  dispatchDays: "[X]",
  deliveryDays: "[X] to [X]",
  returnDays: "[XX]",
  email: "[EMAIL]",
  hours: "[HOURS]",
  replyDays: "[X]",
  refundDays: "[X]",
  social: { instagram: "#", tiktok: "#" },
};

/** Collection handles the navigation points at. Create these collections in Shopify admin. */
export const nav = [
  { label: "New in", href: "/collections/new-in" },
  { label: "Women", href: "/collections/women" },
  { label: "Men", href: "/collections/men" },
  { label: "Accessories", href: "/collections/accessories" },
];

export const footerNav = [
  {
    title: "Shop",
    links: [
      ...nav,
      { label: "Gift cards", href: "/collections/gift-cards" },
    ],
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
      { label: "TikTok", href: site.social.tiktok },
    ],
  },
];

/**
 * Department pages, keyed by collection handle. The intro shows until the collection has a
 * description in Shopify. The editorial block between the product grids comes from the
 * "campaign" metaobject with the same handle; these set its colour and which side the picture sits.
 */
export const departments: Record<string, { intro: string; tone: string; imageFirst: boolean; imageSearch: string }> = {
  women: {
    intro: "Dresses, sets, boubous and headwraps in adire, kente, aso-oke, bògòlan and wax-print cloth.",
    tone: "#2B3049",
    imageFirst: true,
    // Until the collection exists, the home page's tile shows the first product this search finds.
    imageSearch: "dress",
  },
  men: {
    intro: "Kaftans, agbada, shirts and trousers in aso-oke, kente, bògòlan, adire and wax-print cloth.",
    tone: "#2F3438",
    imageFirst: false,
    imageSearch: "kaftan",
  },
};

export const popularSearches = ["Adire", "Kaftan", "Headwrap", "Kente", "Agbada", "Wax print"];

/** Founder copy for the Our story page. Replace the bracketed text. */
export const story = {
  opening: `${site.brand} began in [YEAR] in [CITY], when [FOUNDER NAME] [what started it, in a sentence]. Today we make contemporary clothing for women and men from adire, kente, aso-oke, bògòlan and wax-print cloth.`,
  makers: "[Who makes the pieces and how you work with them: the tailors, dyers and weavers. Name them where you can.]",
  quote: "[A sentence from the founder, in their own words, on why this matters.]",
  founder: "[FOUNDER NAME]",
};

/** Delivery services shown on the Help page. Match these to Shopify's shipping settings. */
export const deliveryRates = [
  { service: "UK standard", arrives: "[X]–[X] working days", cost: `£[X.XX], free over ${site.freeDeliveryThreshold}` },
  { service: "UK next day", arrives: "Order by [TIME], Monday to Thursday", cost: "£[X.XX]" },
  { service: "International", arrives: "[X]–[X] working days", cost: "Shown at checkout" },
];
