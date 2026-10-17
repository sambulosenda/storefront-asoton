import { cacheLife, cacheTag } from "next/cache";

// Falls back to Shopify's public demo store so the app runs before a real store is connected.
const domain = process.env.SHOPIFY_STORE_DOMAIN;
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-10";
const endpoint = domain
  ? `https://${domain}/api/${apiVersion}/graphql.json`
  : "https://mock.shop/api";
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export type Money = { amount: string; currencyCode: string };

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: Money };
};

async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(endpoint, {
    signal: AbortSignal.timeout(10_000),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { "X-Shopify-Storefront-Access-Token": token }),
    },
    body: JSON.stringify({ query, variables }),
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

const productFields = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    featuredImage {
      url
      altText
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
`;

export async function getProducts(first = 12): Promise<Product[]> {
  "use cache";
  cacheTag("products");

  try {
    const data = await shopifyFetch<{ products: { nodes: Product[] } }>(
      `${productFields}
      query Products($first: Int!) {
        products(first: $first) {
          nodes {
            ...ProductFields
          }
        }
      }`,
      { first },
    );
    cacheLife("hours");
    return data.products.nodes;
  } catch (error) {
    console.error(error);
    // Keep failures short-lived so the catalog recovers soon after Shopify does.
    cacheLife("minutes");
    return [];
  }
}

export async function getProduct(handle: string): Promise<Product | null> {
  "use cache";
  cacheTag("products", `product-${handle}`);

  try {
    const data = await shopifyFetch<{ product: Product | null }>(
      `${productFields}
      query Product($handle: String!) {
        product(handle: $handle) {
          ...ProductFields
        }
      }`,
      { handle },
    );
    cacheLife("hours");
    return data.product;
  } catch (error) {
    console.error(error);
    cacheLife("minutes");
    return null;
  }
}

export function formatMoney({ amount, currencyCode }: Money) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}
