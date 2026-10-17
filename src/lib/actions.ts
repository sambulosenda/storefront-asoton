"use server";

import {
  getCollectionOrAll,
  predictiveSearch,
  searchProducts,
  type PredictiveResults,
  type Product,
  type SortKey,
} from "@/lib/shopify";

export async function searchAction(query: string): Promise<PredictiveResults> {
  const q = query.trim().slice(0, 100);
  if (!q) return { queries: [], collections: [], products: [] };
  return predictiveSearch(q);
}

export type MoreResult = { products: Product[]; endCursor: string | null; hasNextPage: boolean };

/** The next page of a collection (or search) for "Load more". */
export async function loadMoreAction(args: {
  handle?: string;
  query?: string;
  sort: SortKey;
  filters: string[];
  after: string;
}): Promise<MoreResult> {
  const page = args.query
    ? await searchProducts({ query: args.query, sort: args.sort, after: args.after })
    : await getCollectionOrAll({ handle: args.handle ?? "all", sort: args.sort, filters: args.filters, after: args.after });
  return { products: page.products, endCursor: page.pageInfo.endCursor, hasNextPage: page.pageInfo.hasNextPage };
}

export type FormState = { ok: boolean; message: string } | null;

const NOT_SET_UP = "Sign-ups aren’t switched on yet. Please try again soon.";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The design has no email or messaging backend yet. These check the input and say plainly
// that nothing was sent, rather than pretending it worked. Connect Shopify Customer
// (customerCreate with acceptsMarketing), Klaviyo or a contact service here.

export async function subscribeAction(_: FormState, data: FormData): Promise<FormState> {
  if (!EMAIL.test(String(data.get("email") ?? ""))) return { ok: false, message: "Enter an email address, like name@example.com." };
  return { ok: false, message: NOT_SET_UP };
}

export async function notifyAction(_: FormState, data: FormData): Promise<FormState> {
  if (!EMAIL.test(String(data.get("email") ?? ""))) return { ok: false, message: "Enter an email address, like name@example.com." };
  return { ok: false, message: "Back-in-stock emails aren’t switched on yet. Please check back soon." };
}

export async function contactAction(_: FormState, data: FormData): Promise<FormState> {
  if (!String(data.get("name") ?? "").trim()) return { ok: false, message: "Enter your name." };
  if (!EMAIL.test(String(data.get("email") ?? ""))) return { ok: false, message: "Enter an email address, like name@example.com." };
  if (!String(data.get("message") ?? "").trim()) return { ok: false, message: "Write a message." };
  return { ok: false, message: "The contact form isn’t connected yet. Please email us instead." };
}
