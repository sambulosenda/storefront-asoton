// A small in-memory Storefront API for the end-to-end tests. Loaded into the Next.js
// server with NODE_OPTIONS=--require, it answers the requests that would go to
// mock.shop (the app's fallback when no store is configured), so tests never touch
// a real shop and always see the same catalog.
const realFetch = globalThis.fetch;

// Three markets, so the country selector has something to switch between.
const MARKETS = [
  { isoCode: "GB", name: "United Kingdom", currency: { isoCode: "GBP", symbol: "£" }, rate: 1 },
  { isoCode: "US", name: "United States", currency: { isoCode: "USD", symbol: "$" }, rate: 1.3 },
  { isoCode: "FR", name: "France", currency: { isoCode: "EUR", symbol: "€" }, rate: 1.2 },
];
let market = MARKETS[0];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const marketOut = ({ rate, ...m }) => m;
const WOMEN = ["6", "8", "10", "12", "14", "16", "18", "20"];
const MEN = ["S", "M", "L", "XL", "XXL", "3XL"];
// The agbada set's sizes are written the way many Shopify stores write them: UK, US and EU in one
// value, and not in size order.
const AGBADA = ["UK 4XL, USA 3XL, EUR 4XL", "UK L, USA M, EUR L", "UK S, USA XS, EUR S", "UK XXL, USA XL, EUR XXL", "UK M, USA S, EUR M", "UK XL, USA L, EUR XL"];
// The bògòlan pieces carry no tag, so a search for "bogolan" finds nothing and the home page
// leaves that cloth out, as it would for a store with no bògòlan.
const CATALOG = [
  ["Adire Wrap Dress", "Indigo", "Dress", "women", 185, ["new", "adire"]],
  ["Aso-oke Kaftan", "Ecru and gold", "Kaftan", "men", 240, ["new", "aso-oke"]],
  ["Wax-print Two-piece Set", "Terracotta", "Set", "women", 165, ["wax print", "ankara"]],
  ["Bògòlan Overshirt", "Umber", "Shirt", "men", 150, []],
  ["Adire Headwrap", "Indigo", "Headwrap", "women", 45, ["adire"]],
  ["Kente Panel Midi Skirt", "Gold and forest", "Skirt", "women", 175, ["kente"]],
  ["Adire Kaftan", "Indigo", "Kaftan", "men", 195, ["adire"]],
  ["Aso-oke Boubou", "Ecru and gold", "Boubou", "women", 260, ["aso-oke"]],
  ["Bògòlan Shirt Dress", "Umber", "Dress", "women", 170, []],
  ["Wax-print Maxi Dress", "Terracotta", "Dress", "women", 155, ["wax print", "ankara"]],
  ["Kente Stole", "Gold and forest", "Stole", "men", 85, ["kente"]],
  ["Adire Drawstring Trousers", "Indigo", "Trousers", "men", 110, ["adire"]],
  ["Aso-oke Agbada Set", "Wine and gold", "Agbada", "men", 420, ["aso-oke"]],
  ["Aso-oke Fila Cap", "Wine and gold", "Cap", "men", 40, ["aso-oke"]],
];
const handleOf = (t) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "");
// Prices are stored in pounds and converted for the market of the current request.
const money = (n, m = market) => ({ amount: (n * m.rate).toFixed(1), currencyCode: m.currency.isoCode });
const gbp = (n) => ({ amount: n.toFixed(1), currencyCode: "GBP" });
const products = CATALOG.map(([title, colour, type, dept, price, tags], i) => {
  const handle = handleOf(title);
  const sizes = ["Headwrap", "Stole", "Cap"].includes(type) ? ["One size"] : type === "Agbada" ? AGBADA : dept === "men" ? MEN : WOMEN;
  const colours = title === "Adire Wrap Dress" ? [colour, "Sky", "Charcoal"] : [colour];
  return {
    id: `gid://shopify/Product/${i + 1}`,
    handle,
    title,
    tags,
    productType: type,
    availableForSale: title !== "Bògòlan Shirt Dress",
    featuredImage: null,
    priceRange: { minVariantPrice: gbp(price) },
    options: [
      { name: "Colour", optionValues: colours.map((c) => ({ name: c, swatch: c === "Indigo" ? { color: "#1E2A55" } : c === "Sky" ? { color: "#6F86B5" } : c === "Charcoal" ? { color: "#3A3A3A" } : null })) },
      { name: "Size", optionValues: sizes.map((s) => ({ name: s, swatch: null })) },
    ],
    _dept: dept,
    _variants: colours.flatMap((c) =>
      sizes.map((s, j) => ({
        id: `gid://shopify/ProductVariant/${i + 1}${colours.indexOf(c)}${j}`,
        title: `${c} / ${s}`,
        availableForSale: title !== "Bògòlan Shirt Dress" && !(title === "Adire Wrap Dress" && s === "18"),
        quantityAvailable: 2,
        price: gbp(price),
        compareAtPrice: null,
        selectedOptions: [{ name: "Colour", value: c }, { name: "Size", value: s }],
      })),
    ),
  };
});
const convert = (m) => ({ amount: (Number(m.amount) * market.rate).toFixed(1), currencyCode: market.currency.isoCode });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const card = ({ _dept, _variants, ...p }) => ({ ...p, priceRange: { minVariantPrice: convert(p.priceRange.minVariantPrice) } });
const byHandle = (h) => products.find((p) => p.handle === h);
const filtersFor = (list) => [
  { id: "filter.p.m.custom.cloth", label: "Cloth", type: "LIST", values: ["Adire", "Kente", "Bògòlanfini", "Aso-oke", "Wax print"].map((n, i) => ({ id: `c${i}`, label: n, count: list.filter((p) => p.tags.some((t) => n.toLowerCase().startsWith(t.slice(0, 3)))).length, input: JSON.stringify({ productMetafield: { namespace: "custom", key: "cloth", value: n } }), swatch: null })) },
  { id: "filter.v.option.colour", label: "Colour", type: "LIST", values: ["Indigo", "Ecru and gold", "Terracotta", "Umber", "Gold and forest", "Wine and gold", "Sky"].map((n, i) => ({ id: `k${i}`, label: n, count: 2, input: JSON.stringify({ variantOption: { name: "colour", value: n } }), swatch: null })) },
  { id: "filter.v.option.size", label: "Size", type: "LIST", values: WOMEN.map((n, i) => ({ id: `s${i}`, label: n, count: n === "6" ? 0 : 4, input: JSON.stringify({ variantOption: { name: "size", value: n } }), swatch: null })) },
  { id: "filter.v.price", label: "Price", type: "PRICE_RANGE", values: [{ id: "p", label: "Price", count: 0, input: JSON.stringify({ price: { min: 0, max: 420 } }), swatch: null }] },
  { id: "filter.v.availability", label: "Availability", type: "LIST", values: [{ id: "a1", label: "In stock", count: 12, input: '{"available":true}', swatch: null }, { id: "a0", label: "Out of stock", count: 1, input: '{"available":false}', swatch: null }] },
];
let cart = null;
const lineCost = (l) => l.quantity * Number(l.v.price.amount);
const cartOut = () => cart && {
  id: "gid://shopify/Cart/1", checkoutUrl: "https://example.com/checkout", totalQuantity: cart.lines.reduce((n, l) => n + l.quantity, 0),
  cost: { subtotalAmount: money(cart.lines.reduce((n, l) => n + lineCost(l), 0), cart.market) },
  lines: { nodes: cart.lines.map((l) => ({ id: l.id, quantity: l.quantity, cost: { totalAmount: money(lineCost(l), cart.market) }, merchandise: { id: l.v.id, title: l.v.title, quantityAvailable: 2, selectedOptions: l.v.selectedOptions, image: null, product: { handle: l.p.handle, title: l.p.title, tags: l.p.tags, productType: l.p.productType } } })) },
};
function addLines(lines) {
  cart ??= { lines: [], market: MARKETS[0] };
  for (const { merchandiseId, quantity } of lines) {
    const p = products.find((x) => x._variants.some((v) => v.id === merchandiseId));
    const v = p._variants.find((x) => x.id === merchandiseId);
    const existing = cart.lines.find((l) => l.v.id === merchandiseId);
    if (existing) existing.quantity += quantity ?? 1;
    else cart.lines.push({ id: `line-${merchandiseId}`, quantity: quantity ?? 1, v, p });
  }
}
function respond(query, vars) {
  const op = query.match(/(query|mutation) (\w+)/g)?.pop()?.split(" ")[1];
  market = MARKETS.find((m) => m.isoCode === vars.country) ?? MARKETS[0];
  switch (op) {
    case "Markets": return { localization: { country: marketOut(MARKETS[0]), availableCountries: MARKETS.map(marketOut) } };
    case "Collection": {
      const map = { women: "women", men: "men" };
      if (!["women", "men", "new-in"].includes(vars.handle)) return { collection: null };
      let list = vars.handle === "new-in" ? products.slice(0, 12) : products.filter((p) => p._dept === map[vars.handle]);
      // Size 6 has no stock (its filter is disabled); size 20 matches nothing once applied.
      if (vars.filters?.some((f) => f.variantOption?.value === "20")) list = [];
      const start = vars.after ? Number(vars.after) : 0;
      const page = list.slice(start, start + vars.first);
      const titles = { women: "Women", men: "Men", "new-in": "New in" };
      // Only Women has a collection image, so the home page shows one tile with a photo and one without.
      const image = vars.handle === "women" ? { url: "https://cdn.shopify.com/s/files/fixture/women.jpg", altText: null, width: 1200, height: 1500 } : null;
      return { collection: { id: "c", handle: vars.handle, title: titles[vars.handle], description: "", image, products: { filters: filtersFor(list), pageInfo: { hasNextPage: start + vars.first < list.length, endCursor: String(start + vars.first) }, nodes: page.map(card) } } };
    }
    case "SitemapProducts": return { products: { nodes: products.map((p) => ({ handle: p.handle, updatedAt: "2026-10-01T00:00:00Z", images: { nodes: [] } })), pageInfo: { hasNextPage: false, endCursor: null } } };
    case "SitemapCollections": return { collections: { nodes: ["new-in", "women", "men"].map((handle) => ({ handle, updatedAt: "2026-10-01T00:00:00Z", images: { nodes: [] } })), pageInfo: { hasNextPage: false, endCursor: null } } };
    case "Products": return { products: { nodes: products.slice(0, vars.first).map(card), pageInfo: { hasNextPage: false, endCursor: null } } };
    case "Product": {
      const p = byHandle(vars.handle);
      if (!p) return { product: null };
      const { _dept, _variants, ...rest } = p;
      return { product: { ...rest, priceRange: { minVariantPrice: convert(rest.priceRange.minVariantPrice) }, description: "A wrap dress cut from adire.", descriptionHtml: "<p>A wrap dress cut from adire, the indigo resist-dyed cloth of the Yorùbá. Because the pattern is made by hand, no two panels sit exactly alike. Self-tie waist, three-quarter sleeves and a midi hem with room to move.</p>", seo: { title: null, description: null }, variants: { nodes: _variants.map((v) => ({ ...v, price: convert(v.price) })) }, images: { nodes: [] }, collections: { nodes: _dept === "men" ? [{ handle: "men", title: "Men" }] : [{ handle: "women", title: "Women" }, { handle: "dresses", title: "Dresses" }] }, metafields: [{ namespace: "custom", key: "model", value: "Model is 5ft 9in and wears UK 10.", reference: null }, { namespace: "reviews", key: "rating", value: '{"value":"4.8"}', reference: null }, { namespace: "reviews", key: "rating_count", value: "24", reference: null }] } };
    }
    case "Recommendations": return { productRecommendations: [byHandle("adire-headwrap"), byHandle("kente-stole"), byHandle("aso-oke-fila-cap"), byHandle("adire-drawstring-trousers")].map(card) };
    case "Search": {
      const q = vars.query.toLowerCase();
      const list = products.filter((p) => (p.title + " " + p.tags.join(" ")).toLowerCase().includes(q));
      return { search: { nodes: list.slice(0, vars.first).map(card), pageInfo: { hasNextPage: false, endCursor: null } } };
    }
    case "Predictive": {
      const q = vars.query.toLowerCase();
      const list = products.filter((p) => p.title.toLowerCase().includes(q));
      return { predictiveSearch: { queries: ["adire", "adire dress", "adire headwrap", "adire kaftan", "kaftan", "kente"].filter((t) => t.includes(q)).map((text) => ({ text })), collections: q.startsWith("adi") ? [{ handle: "adire", title: "Adire" }] : [], products: list.slice(0, 4).map(card) } };
    }
    case "Menu": {
      const items = { women: ["Dresses", "Two-piece sets", "Kaftans and boubous", "Tops and skirts", "Headwraps"], men: ["Kaftans", "Agbada", "Shirts", "Trousers", "Sets", "Caps and stoles"] }[vars.handle];
      return { menu: items ? { items: items.map((t) => ({ title: t, url: `https://x/collections/${handleOf(t)}`, resource: { handle: `${vars.handle}-${handleOf(t)}` } })) } : null };
    }
    case "Cloths": return { metaobjects: { nodes: [] } };
    case "Looks": return { metaobjects: { nodes: [] } };
    case "Campaign": return { metaobject: null };
    case "Threshold": return { shop: { metafield: { value: '{"amount":"150.00","currency_code":"GBP"}' } } };
    case "Policies": return { shop: { privacyPolicy: { title: "Privacy policy", body: "<p>Policy text.</p>" }, termsOfService: null, refundPolicy: null, shippingPolicy: null } };
    case "Cart": return { cart: cartOut() };
    case "CartCreate": cart = null; addLines(vars.lines ?? []); cart.market = MARKETS.find((m) => m.isoCode === vars.buyerIdentity?.countryCode) ?? MARKETS[0]; return { cartCreate: { cart: cartOut(), userErrors: [] } };
    case "CartLinesAdd": addLines(vars.lines); return { cartLinesAdd: { cart: cartOut(), userErrors: [] } };
    case "CartLinesUpdate": for (const u of vars.lines) { const l = cart.lines.find((x) => x.id === u.id); if (l) l.quantity = Math.min(u.quantity, 2); } cart.lines = cart.lines.filter((l) => l.quantity > 0); return { cartLinesUpdate: { cart: cartOut(), userErrors: [] } };
    case "CartBuyerIdentityUpdate": if (cart) cart.market = MARKETS.find((m) => m.isoCode === vars.buyerIdentity.countryCode) ?? MARKETS[0]; return { cartBuyerIdentityUpdate: { cart: cartOut(), userErrors: [] } };
    case "CartLinesRemove": cart.lines = cart.lines.filter((l) => !vars.lineIds.includes(l.id)); return { cartLinesRemove: { cart: cartOut(), userErrors: [] } };
  }
  console.warn("[mock] unhandled op", op);
  return {};
}
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input.url;
  if (url.includes("mock.shop")) {
    const { query, variables } = JSON.parse(init.body);
    return new Response(JSON.stringify({ data: respond(query, variables ?? {}) }), { headers: { "content-type": "application/json" } });
  }
  return realFetch(input, init);
};
