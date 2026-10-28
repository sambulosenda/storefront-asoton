"use server";

import {
  getCollectionOrAll,
  predictiveSearch,
  searchProducts,
  subscribeEmail,
  type PredictiveResults,
  type Product,
  type SortKey,
} from "@/lib/shopify";
import { getCountry } from "@/lib/market";
import { emailShop } from "@/lib/email";
import { siteUrl } from "@/lib/site";

export async function searchAction(query: string): Promise<PredictiveResults> {
  const q = query.trim().slice(0, 100);
  if (!q) return { queries: [], collections: [], products: [] };
  return predictiveSearch(q, await getCountry());
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
  const country = await getCountry();
  const page = args.query
    ? await searchProducts({ query: args.query, sort: args.sort, after: args.after, country })
    : await getCollectionOrAll({ handle: args.handle ?? "all", sort: args.sort, filters: args.filters, after: args.after, country });
  return { products: page.products, endCursor: page.pageInfo.endCursor, hasNextPage: page.pageInfo.hasNextPage };
}

/** `values` echoes what was typed, so a form can refill itself after React resets it. */
export type FormState = { ok: boolean; message: string; values?: Record<string, string> } | null;

const NOT_SET_UP = "Sign-ups aren’t switched on yet. Please try again soon.";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BAD_EMAIL = "Enter an email address, like name@example.com.";

/** A field people can't see, so only bots fill it in. Their sends are dropped quietly. */
const isBot = (data: FormData) => Boolean(String(data.get("company") ?? "").trim());
const clip = (value: FormDataEntryValue | null, max: number) => String(value ?? "").slice(0, max);

// Sign-ups go to Shopify customers with email marketing on (see subscribeEmail). Back-in-stock
// requests and contact messages are emailed to the shop through Resend (see lib/email.ts).
// When neither is set up, the forms say plainly that nothing was sent.

export async function subscribeAction(_: FormState, data: FormData): Promise<FormState> {
  const values = { email: clip(data.get("email"), 200).trim() };
  if (!EMAIL.test(values.email)) return { ok: false, message: BAD_EMAIL, values };
  if (isBot(data)) return { ok: true, message: "Thank you. You’re on the list." };

  const result = await subscribeEmail(values.email);
  if (result === "subscribed") return { ok: true, message: "Thank you. You’re on the list." };
  // Already a customer: Shopify won't change their marketing choice from here, so ask the shop to.
  const sent = await emailShop({
    subject: `Newsletter sign-up: ${values.email}`,
    text:
      result === "already"
        ? `${values.email} signed up for the newsletter. They are already a customer, so turn on email marketing for them in Shopify admin > Customers.`
        : `${values.email} signed up for the newsletter, but adding them in Shopify failed. Add them in Shopify admin > Customers with email marketing on.`,
  });
  if (result === "already" || sent) return { ok: true, message: "Thank you. You’re on the list." };
  return { ok: false, message: NOT_SET_UP, values };
}

export async function notifyAction(_: FormState, data: FormData): Promise<FormState> {
  const values = { email: clip(data.get("email"), 200).trim() };
  if (!EMAIL.test(values.email)) return { ok: false, message: BAD_EMAIL, values };
  if (isBot(data)) return { ok: true, message: "" };

  const piece = clip(data.get("piece"), 200);
  const option = clip(data.get("option"), 100);
  const url = `${siteUrl}/products/${encodeURIComponent(clip(data.get("handle"), 200))}`;
  const sent = await emailShop({
    subject: `Back in stock request: ${piece}${option ? `, ${option}` : ""}`,
    text: `${values.email} wants an email when this is back in stock.\n\n${piece}${option ? `\n${option}` : ""}\n${url}`,
    replyTo: values.email,
  });
  if (sent) return { ok: true, message: "" };
  return { ok: false, message: "Back-in-stock emails aren’t switched on yet. Please check back soon.", values };
}

export async function contactAction(_: FormState, data: FormData): Promise<FormState> {
  const values = Object.fromEntries(["name", "email", "order", "topic", "message"].map((k) => [k, clip(data.get(k), 5000)]));
  if (!values.name.trim()) return { ok: false, message: "Enter your name.", values };
  if (!EMAIL.test(values.email.trim())) return { ok: false, message: BAD_EMAIL, values };
  if (!values.message.trim()) return { ok: false, message: "Write a message.", values };
  if (isBot(data)) return { ok: true, message: "" };

  const sent = await emailShop({
    subject: `${values.topic || "Message"} from ${values.name.trim()}${values.order.trim() ? ` (order ${values.order.trim()})` : ""}`,
    text: [
      `From: ${values.name.trim()} <${values.email.trim()}>`,
      `Topic: ${values.topic}`,
      ...(values.order.trim() ? [`Order: ${values.order.trim()}`] : []),
      "",
      values.message.trim(),
      "",
      "Reply to this email to answer them.",
    ].join("\n"),
    replyTo: values.email.trim(),
  });
  if (sent) return { ok: true, message: "" };
  return { ok: false, message: "The contact form isn’t connected yet. Please email us instead.", values };
}
