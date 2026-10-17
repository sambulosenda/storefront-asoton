import { cacheLife, cacheTag } from "next/cache";
import type {
  Cart,
  ClothEntry,
  Collection,
  CollectionPage,
  Filter,
  Image,
  MenuLink,
  PredictiveResults,
  Product,
  ProductDetail,
  SortKey,
} from "./types";

export * from "./types";

// Falls back to Shopify's public demo store so the app runs before a real store is connected.
const domain = process.env.SHOPIFY_STORE_DOMAIN;
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-10";
const endpoint = domain
  ? `https://${domain}/api/${apiVersion}/graphql.json`
  : "https://mock.shop/api";
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

/** Shopify-hosted customer account sign-in, or null on the demo store. */
export const accountUrl = domain ? `https://${domain}/account` : null;

/**
 * Prices and availability for a country (Shopify Markets): adds `$country` and the
 * `@inContext` directive to the first query in the document.
 */
export function withCountry(query: string) {
  return query.replace(
    /\bquery\s+(\w+)\s*(?:\(([^)]*)\))?\s*\{/,
    (_, name: string, vars?: string) =>
      `query ${name}(${vars?.trim() ? `${vars.trim()}, ` : ""}$country: CountryCode) @inContext(country: $country) {`,
  );
}

export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  if (variables?.country) query = withCountry(query);
  const res = await fetch(endpoint, {
    signal: AbortSignal.timeout(10_000),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { "X-Shopify-Storefront-Access-Token": token }),
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Shopify request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join("\n"));
  }
  return json.data;
}

const imageFields = /* GraphQL */ `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`;

const productCardFields = /* GraphQL */ `
  fragment ProductCardFields on Product {
    id
    handle
    title
    tags
    productType
    availableForSale
    featuredImage {
      ...ImageFields
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    options(first: 5) {
      name
      optionValues {
        name
        swatch {
          color
        }
      }
    }
  }
`;

const fragments = imageFields + productCardFields;

const SORTS: Record<SortKey, { key: string; reverse: boolean }> = {
  featured: { key: "COLLECTION_DEFAULT", reverse: false },
  "best-selling": { key: "BEST_SELLING", reverse: false },
  newest: { key: "CREATED", reverse: true },
  "price-asc": { key: "PRICE", reverse: false },
  "price-desc": { key: "PRICE", reverse: true },
};

// The plain products() query uses ProductSortKeys, whose names differ slightly.
const ALL_PRODUCT_SORTS: Record<SortKey, string> = {
  featured: "BEST_SELLING",
  "best-selling": "BEST_SELLING",
  newest: "CREATED_AT",
  "price-asc": "PRICE",
  "price-desc": "PRICE",
};

type CollectionArgs = {
  handle: string;
  sort?: SortKey;
  filters?: string[];
  after?: string | null;
  first?: number;
  /** ISO country code for market prices; the store's default market when omitted. */
  country?: string;
};

/**
 * A collection with one page of products. Returns null when the collection does not exist.
 * `filters` are the raw JSON `input` strings Shopify hands back on each filter value.
 */
export async function getCollection({
  handle,
  sort = "featured",
  filters = [],
  after = null,
  first = 12,
  country,
}: CollectionArgs): Promise<CollectionPage | null> {
  "use cache";
  cacheTag("products", `collection-${handle}`);

  try {
    const { key, reverse } = SORTS[sort];
    const data = await shopifyFetch<{ collection: RawCollectionPage | null }>(
      `${fragments}
      query Collection(
        $handle: String!
        $first: Int!
        $after: String
        $sortKey: ProductCollectionSortKeys!
        $reverse: Boolean!
        $filters: [ProductFilter!]
      ) {
        collection(handle: $handle) {
          id
          handle
          title
          description
          image {
            ...ImageFields
          }
          products(
            first: $first
            after: $after
            sortKey: $sortKey
            reverse: $reverse
            filters: $filters
          ) {
            filters {
              id
              label
              type
              values {
                id
                label
                count
                input
                swatch {
                  color
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              ...ProductCardFields
            }
          }
        }
      }`,
      {
        handle,
        first,
        after,
        sortKey: key,
        reverse,
        filters: filters.flatMap(parseFilter),
        country,
      },
    );
    cacheLife("hours");
    const c = data.collection;
    if (!c) return null;
    return {
      collection: { id: c.id, handle: c.handle, title: c.title, description: c.description, image: c.image },
      products: c.products.nodes,
      filters: c.products.filters,
      pageInfo: c.products.pageInfo,
    };
  } catch (error) {
    console.error(error);
    // Keep failures short-lived so the catalog recovers soon after Shopify does.
    cacheLife("minutes");
    return null;
  }
}

type RawCollectionPage = Collection & {
  products: {
    nodes: Product[];
    filters: Filter[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

function parseFilter(input: string) {
  try {
    return [JSON.parse(input)];
  } catch {
    return [];
  }
}

/** Every product in the store, for when a named collection hasn't been set up yet. */
export async function getProducts({
  first = 12,
  sort = "featured",
  after = null,
  country,
}: { first?: number; sort?: SortKey; after?: string | null; country?: string } = {}): Promise<{
  products: Product[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}> {
  "use cache";
  cacheTag("products");

  try {
    const data = await shopifyFetch<{
      products: { nodes: Product[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
    }>(
      `${fragments}
      query Products($first: Int!, $after: String, $sortKey: ProductSortKeys!, $reverse: Boolean!) {
        products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            ...ProductCardFields
          }
        }
      }`,
      { first, after, sortKey: ALL_PRODUCT_SORTS[sort], reverse: SORTS[sort].reverse, country },
    );
    cacheLife("hours");
    return { products: data.products.nodes, pageInfo: data.products.pageInfo };
  } catch (error) {
    console.error(error);
    cacheLife("minutes");
    return { products: [], pageInfo: { hasNextPage: false, endCursor: null } };
  }
}

/** A collection's products, or the whole catalog if the collection doesn't exist yet. */
export async function getCollectionOrAll(args: CollectionArgs): Promise<CollectionPage> {
  const page = await getCollection(args);
  if (page) return page;
  // Without a new-in collection, the newest products stand in for it (featured would be best-selling).
  const sort = args.handle === "new-in" && (args.sort ?? "featured") === "featured" ? "newest" : args.sort;
  const all = await getProducts({ first: args.first, sort, after: args.after, country: args.country });
  return { collection: null, products: all.products, filters: [], pageInfo: all.pageInfo };
}

const productDetailQuery = /* GraphQL */ `
  query Product($handle: String!) {
    product(handle: $handle) {
      ...ProductCardFields
      description
      descriptionHtml
      seo {
        title
        description
      }
      variants(first: 100) {
        nodes {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
      images(first: 10) {
        nodes {
          ...ImageFields
        }
      }
      collections(first: 3) {
        nodes {
          handle
          title
        }
      }
      metafields(
        identifiers: [
          { namespace: "custom", key: "care" }
          { namespace: "custom", key: "fit" }
          { namespace: "custom", key: "model" }
          { namespace: "custom", key: "cloth" }
          { namespace: "reviews", key: "rating" }
          { namespace: "reviews", key: "rating_count" }
        ]
      ) {
        namespace
        key
        value
        reference {
          ... on Metaobject {
            handle
            fields {
              key
              value
            }
          }
        }
      }
    }
  }
`;

export async function getProduct(handle: string, country?: string): Promise<ProductDetail | null> {
  "use cache";
  cacheTag("products", `product-${handle}`);

  try {
    const data = await shopifyFetch<{ product: RawProductDetail | null }>(
      `${fragments}${productDetailQuery}`,
      { handle, country },
    );
    cacheLife("hours");
    const p = data.product;
    if (!p) return null;
    const meta = (namespace: string, key: string) =>
      p.metafields.find((m) => m && m.namespace === namespace && m.key === key) ?? null;
    const cloth = meta("custom", "cloth")?.reference;
    return {
      ...p,
      variants: p.variants.nodes,
      images: p.images.nodes,
      collections: p.collections.nodes,
      care: meta("custom", "care")?.value ?? null,
      fit: meta("custom", "fit")?.value ?? null,
      model: meta("custom", "model")?.value ?? null,
      clothFields: cloth ? Object.fromEntries(cloth.fields.map((f) => [f.key, f.value])) : null,
      rating: parseRating(meta("reviews", "rating")?.value),
      ratingCount: Number(meta("reviews", "rating_count")?.value) || null,
    };
  } catch (error) {
    console.error(error);
    cacheLife("minutes");
    return null;
  }
}

type RawProductDetail = Omit<
  ProductDetail,
  "variants" | "images" | "collections" | "care" | "fit" | "model" | "clothFields" | "rating" | "ratingCount"
> & {
  variants: { nodes: ProductDetail["variants"] };
  images: { nodes: ProductDetail["images"] };
  collections: { nodes: ProductDetail["collections"] };
  metafields: ({
    namespace: string;
    key: string;
    value: string;
    reference: { handle: string; fields: { key: string; value: string | null }[] } | null;
  } | null)[];
};

// Review apps store the rating as JSON: {"value":"4.8","scale_min":"1.0","scale_max":"5.0"}.
function parseRating(value: string | undefined) {
  if (!value) return null;
  try {
    return Number(JSON.parse(value).value) || null;
  } catch {
    return Number(value) || null;
  }
}

export async function getRecommendations(productId: string, country?: string): Promise<Product[]> {
  "use cache";
  cacheTag("products");

  try {
    const query = `${fragments}
      query Recommendations($productId: ID!, $intent: ProductRecommendationIntent) {
        productRecommendations(productId: $productId, intent: $intent) {
          ...ProductCardFields
        }
      }`;
    const complementary = await shopifyFetch<{ productRecommendations: Product[] | null }>(query, {
      productId,
      intent: "COMPLEMENTARY",
      country,
    });
    let products = complementary.productRecommendations ?? [];
    if (products.length === 0) {
      const related = await shopifyFetch<{ productRecommendations: Product[] | null }>(query, {
        productId,
        intent: "RELATED",
        country,
      });
      products = related.productRecommendations ?? [];
    }
    cacheLife("hours");
    return products.slice(0, 4);
  } catch (error) {
    console.error(error);
    cacheLife("minutes");
    return [];
  }
}

export async function searchProducts({
  query,
  sort = "featured",
  after = null,
  first = 12,
  country,
}: {
  query: string;
  sort?: SortKey;
  after?: string | null;
  first?: number;
  country?: string;
}): Promise<{ products: Product[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } }> {
  "use cache";
  cacheTag("products");

  try {
    const sortKey = sort === "price-asc" || sort === "price-desc" ? "PRICE" : "RELEVANCE";
    const data = await shopifyFetch<{
      search: {
        nodes: Product[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    }>(
      `${fragments}
      query Search($query: String!, $first: Int!, $after: String, $sortKey: SearchSortKeys!, $reverse: Boolean!) {
        search(query: $query, first: $first, after: $after, types: PRODUCT, sortKey: $sortKey, reverse: $reverse) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            ... on Product {
              ...ProductCardFields
            }
          }
        }
      }`,
      { query, first, after, sortKey, reverse: sort === "price-desc", country },
    );
    cacheLife("hours");
    return { products: data.search.nodes.filter((n) => n && "handle" in n), pageInfo: data.search.pageInfo };
  } catch (error) {
    console.error(error);
    cacheLife("minutes");
    return { products: [], pageInfo: { hasNextPage: false, endCursor: null } };
  }
}

export async function predictiveSearch(query: string, country?: string): Promise<PredictiveResults> {
  "use cache";
  cacheTag("products");

  try {
    const data = await shopifyFetch<{ predictiveSearch: PredictiveResults | null }>(
      `${fragments}
      query Predictive($query: String!) {
        predictiveSearch(query: $query, limit: 5, types: [QUERY, COLLECTION, PRODUCT]) {
          queries {
            text
          }
          collections {
            handle
            title
          }
          products {
            ...ProductCardFields
          }
        }
      }`,
      { query, country },
    );
    cacheLife("hours");
    return data.predictiveSearch ?? { queries: [], collections: [], products: [] };
  } catch (error) {
    console.error(error);
    cacheLife("minutes");
    return { queries: [], collections: [], products: [] };
  }
}

/** Links of a Shopify navigation menu (Content → Menus), as site paths. */
export async function getMenu(handle: string): Promise<MenuLink[]> {
  "use cache";
  cacheTag("menus");

  try {
    const data = await shopifyFetch<{
      menu: { items: { title: string; url: string | null; resource: { handle?: string } | null }[] } | null;
    }>(
      `query Menu($handle: String!) {
        menu(handle: $handle) {
          items {
            title
            url
            resource {
              ... on Collection {
                handle
              }
            }
          }
        }
      }`,
      { handle },
    );
    cacheLife("hours");
    return (data.menu?.items ?? []).flatMap((item) => {
      const href = item.resource?.handle ? `/collections/${item.resource.handle}` : toPath(item.url);
      return href ? [{ title: item.title, href }] : [];
    });
  } catch (error) {
    console.error(error);
    cacheLife("minutes");
    return [];
  }
}

function toPath(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url).pathname;
  } catch {
    return url.startsWith("/") ? url : null;
  }
}

/** Entries of the "cloth" metaobject (name, technique, origin, caption, collection). */
export async function getCloths(): Promise<ClothEntry[]> {
  "use cache";
  cacheTag("metaobjects");

  try {
    const data = await shopifyFetch<{
      metaobjects: {
        nodes: {
          handle: string;
          fields: { key: string; value: string | null; reference: { handle?: string } | null }[];
        }[];
      };
    }>(
      `query Cloths {
        metaobjects(type: "cloth", first: 10) {
          nodes {
            handle
            fields {
              key
              value
              reference {
                ... on Collection {
                  handle
                }
              }
            }
          }
        }
      }`,
    );
    cacheLife("hours");
    return data.metaobjects.nodes.map((node) => {
      const field = (key: string) => node.fields.find((f) => f.key === key);
      return {
        handle: node.handle,
        name: field("name")?.value ?? node.handle,
        technique: field("technique")?.value ?? null,
        origin: field("origin")?.value ?? null,
        caption: field("caption")?.value ?? null,
        collectionHandle: field("collection")?.reference?.handle ?? null,
      };
    });
  } catch (error) {
    console.error(error);
    cacheLife("minutes");
    return [];
  }
}

/**
 * A "campaign" metaobject: the home hero (handle "home") and the editorial blocks on collection
 * pages (handle = the collection's handle, such as "women").
 */
export async function getCampaign(handle: string) {
  "use cache";
  cacheTag("metaobjects");

  try {
    const data = await shopifyFetch<{
      metaobject: {
        fields: {
          key: string;
          value: string | null;
          reference: { image?: { url: string; altText: string | null; width: number; height: number } } | null;
        }[];
      } | null;
    }>(
      `query Campaign($handle: MetaobjectHandleInput!) {
        metaobject(handle: $handle) {
          fields {
            key
            value
            reference {
              ... on MediaImage {
                image {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }`,
      { handle: { type: "campaign", handle } },
    );
    cacheLife("hours");
    const fields = data.metaobject?.fields;
    if (!fields) return null;
    const field = (key: string) => fields.find((f) => f.key === key);
    return {
      label: field("label")?.value ?? null,
      headline: field("headline")?.value ?? null,
      body: field("body")?.value ?? null,
      image: field("image")?.reference?.image ?? null,
      /** Button text and where it goes (a path such as /collections/women, or a full URL). */
      cta: field("cta")?.value ?? null,
      link: field("link")?.value ?? null,
    };
  } catch (error) {
    console.error(error);
    cacheLife("minutes");
    return null;
  }
}

export type Look = { handle: string; title: string; body: string | null; image: Image | null; products: Product[] };

/** The "look" metaobjects for the lookbook: a title, an optional photo and note, and the pieces worn. */
export async function getLooks(country?: string): Promise<Look[]> {
  "use cache";
  cacheTag("metaobjects", "products");

  type Field = {
    key: string;
    value: string | null;
    reference: { image?: Image } | null;
    references: { nodes: Partial<Product>[] } | null;
  };
  try {
    const data = await shopifyFetch<{ metaobjects: { nodes: { handle: string; fields: Field[] }[] } }>(
      `${fragments}
      query Looks {
        metaobjects(type: "look", first: 12) {
          nodes {
            handle
            fields {
              key
              value
              reference {
                ... on MediaImage {
                  image {
                    ...ImageFields
                  }
                }
              }
              references(first: 8) {
                nodes {
                  ... on Product {
                    ...ProductCardFields
                  }
                }
              }
            }
          }
        }
      }`,
      { country },
    );
    cacheLife("hours");
    return data.metaobjects.nodes.map((node) => {
      const field = (key: string) => node.fields.find((f) => f.key === key);
      return {
        handle: node.handle,
        title: field("title")?.value ?? node.handle,
        body: field("body")?.value ?? null,
        image: field("image")?.reference?.image ?? null,
        // A products field can hold other references; keep only the products.
        products: (field("products")?.references?.nodes ?? []).filter((p): p is Product => Boolean(p.handle)),
      };
    });
  } catch (error) {
    console.error(error);
    cacheLife("minutes");
    return [];
  }
}

export async function getFreeDeliveryThreshold(): Promise<number | null> {
  "use cache";
  cacheTag("shop");

  try {
    const data = await shopifyFetch<{ shop: { metafield: { value: string } | null } }>(
      `query Threshold {
        shop {
          metafield(namespace: "custom", key: "free_delivery_threshold") {
            value
          }
        }
      }`,
    );
    cacheLife("hours");
    const raw = data.shop.metafield?.value;
    if (!raw) return null;
    // Money metafields are JSON ({"amount":"150.00","currency_code":"GBP"}); plain numbers work too.
    try {
      const parsed = JSON.parse(raw);
      return Number(typeof parsed === "object" ? parsed.amount : parsed) || null;
    } catch {
      return Number(raw) || null;
    }
  } catch (error) {
    console.error(error);
    cacheLife("minutes");
    return null;
  }
}

const POLICY_FIELDS = {
  "privacy-policy": "privacyPolicy",
  "terms-of-service": "termsOfService",
  "refund-policy": "refundPolicy",
  "shipping-policy": "shippingPolicy",
} as const;

export type PolicyHandle = keyof typeof POLICY_FIELDS;
export const policyHandles = Object.keys(POLICY_FIELDS) as PolicyHandle[];

/** A shop policy from Settings → Policies in Shopify admin. */
export async function getPolicy(handle: PolicyHandle): Promise<{ title: string; body: string } | null> {
  "use cache";
  cacheTag("shop");

  try {
    const data = await shopifyFetch<{ shop: Record<string, { title: string; body: string } | null> }>(
      `query Policies {
        shop {
          privacyPolicy {
            title
            body
          }
          termsOfService {
            title
            body
          }
          refundPolicy {
            title
            body
          }
          shippingPolicy {
            title
            body
          }
        }
      }`,
    );
    cacheLife("hours");
    return data.shop[POLICY_FIELDS[handle]] ?? null;
  } catch (error) {
    console.error(error);
    cacheLife("minutes");
    return null;
  }
}

// ---------------------------------------------------------------- Cart

/** Every product and collection handle, for the sitemap. */
export async function getSitemapEntries(): Promise<{
  products: { handle: string; updatedAt: string }[];
  collections: { handle: string; updatedAt: string }[];
}> {
  "use cache";
  cacheTag("products");

  type Page = { nodes: { handle: string; updatedAt: string }[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
  try {
    const products: Page["nodes"] = [];
    let after: string | null = null;
    // Ten pages of 250 is far more than this catalog needs; the cap keeps a bad cursor from looping.
    for (let i = 0; i < 10; i++) {
      const data: { products: Page } = await shopifyFetch<{ products: Page }>(
        `query SitemapProducts($after: String) {
          products(first: 250, after: $after) {
            nodes {
              handle
              updatedAt
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }`,
        { after },
      );
      products.push(...data.products.nodes);
      if (!data.products.pageInfo.hasNextPage) break;
      after = data.products.pageInfo.endCursor;
    }
    const data = await shopifyFetch<{ collections: Page }>(
      `query SitemapCollections {
        collections(first: 250) {
          nodes {
            handle
            updatedAt
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }`,
    );
    cacheLife("hours");
    return { products, collections: data.collections.nodes };
  } catch (error) {
    console.error(error);
    cacheLife("minutes");
    return { products: [], collections: [] };
  }
}

export type Market = { isoCode: string; name: string; currency: { isoCode: string; symbol: string } };

/** The countries the store sells to (Settings → Markets), and the default one. */
export async function getMarkets(): Promise<{ countries: Market[]; fallback: Market | null }> {
  "use cache";
  cacheTag("markets");

  try {
    const data = await shopifyFetch<{ localization: { country: Market; availableCountries: Market[] } }>(
      `query Markets {
        localization {
          country {
            ...MarketFields
          }
          availableCountries {
            ...MarketFields
          }
        }
      }
      fragment MarketFields on Country {
        isoCode
        name
        currency {
          isoCode
          symbol
        }
      }`,
    );
    cacheLife("hours");
    const { country, availableCountries } = data.localization;
    return {
      countries: [...availableCountries].sort((a, b) => a.name.localeCompare(b.name)),
      fallback: country,
    };
  } catch (error) {
    console.error(error);
    cacheLife("minutes");
    return { countries: [], fallback: null };
  }
}

export const cartFields = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            quantityAvailable
            selectedOptions {
              name
              value
            }
            image {
              url
              altText
              width
              height
            }
            product {
              handle
              title
              tags
              productType
            }
          }
        }
      }
    }
  }
`;

export const cartQueries = {
  get: /* GraphQL */ `
    query Cart($cartId: ID!) {
      cart(id: $cartId) {
        ...CartFields
      }
    }
  `,
  create: /* GraphQL */ `
    mutation CartCreate($lines: [CartLineInput!], $buyerIdentity: CartBuyerIdentityInput) {
      cartCreate(input: { lines: $lines, buyerIdentity: $buyerIdentity }) {
        cart {
          ...CartFields
        }
        userErrors {
          message
        }
      }
    }
  `,
  add: /* GraphQL */ `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFields
        }
        userErrors {
          message
        }
      }
    }
  `,
  update: /* GraphQL */ `
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFields
        }
        userErrors {
          message
        }
      }
    }
  `,
  buyer: /* GraphQL */ `
    mutation CartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
      cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
        cart {
          ...CartFields
        }
        userErrors {
          message
        }
      }
    }
  `,
  remove: /* GraphQL */ `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ...CartFields
        }
        userErrors {
          message
        }
      }
    }
  `,
};

export type { Cart };
