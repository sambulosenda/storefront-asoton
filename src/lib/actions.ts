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

/** `values` echoes what was typed, so a form can refill itself after React resets it. */
export type FormState = { ok: boolean; message: string; values?: Record<string, string> } | null;

const NOT_SET_UP = "Sign-ups aren’t switched on yet. Please try again soon.";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The design has no email or messaging backend yet. These check the input and say plainly
// that nothing was sent, rather than pretending it worked. Connect Shopify Customer
// (customerCreate with acceptsMarketing), Klaviyo or a contact service here.

export async function subscribeAction(_: FormState, data: FormData): Promise<FormState> {
  const values = { email: String(data.get("email") ?? "") };
  if (!EMAIL.test(values.email)) return { ok: false, message: "Enter an email address, like name@example.com.", values };
  return { ok: false, message: NOT_SET_UP, values };
}

export async function notifyAction(_: FormState, data: FormData): Promise<FormState> {
  const values = { email: String(data.get("email") ?? "") };
  if (!EMAIL.test(values.email)) return { ok: false, message: "Enter an email address, like name@example.com.", values };
  return { ok: false, message: "Back-in-stock emails aren’t switched on yet. Please check back soon.", values };
}

export async function contactAction(_: FormState, data: FormData): Promise<FormState> {
  const values = Object.fromEntries(["name", "email", "order", "topic", "message"].map((k) => [k, String(data.get(k) ?? "")]));
  if (!values.name.trim()) return { ok: false, message: "Enter your name.", values };
  if (!EMAIL.test(values.email)) return { ok: false, message: "Enter an email address, like name@example.com.", values };
  if (!values.message.trim()) return { ok: false, message: "Write a message.", values };
  return { ok: false, message: "The contact form isn’t connected yet. Please email us instead.", values };
}
