import type { PostHog } from "posthog-js";
import { parse, readStored } from "@/components/cookie-consent";

/**
 * Where shoppers get to, and where they stop: the steps from seeing a piece to starting checkout,
 * sent to PostHog (funnels and session recordings). Only for shoppers who allowed analytics cookies
 * in the banner; for everyone else nothing loads, nothing is stored and nothing is sent.
 */

/** The shop's PostHog project token ("phc_…"). Without it, nothing loads. */
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
/** PostHog's EU cloud unless the project lives elsewhere. */
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://eu.i.posthog.com";

export type TrackProps = Record<string, string | number | boolean | null>;

let client: PostHog | null = null;
let starting = false;
/** Steps taken between a page opening and the library arriving, sent once it has. */
const waiting: { event: string; props?: TrackProps; at: Date }[] = [];

const allowed = () => !!parse(readStored())?.analytics;

/** Records a step in a shopper's visit, such as "added_to_bag". Does nothing without their consent. */
export function track(event: string, props?: TrackProps) {
  if (typeof window === "undefined" || !KEY || !allowed()) return;
  // For the browser tests, and anything else on the page that wants to follow along.
  window.dispatchEvent(new CustomEvent("shop:track", { detail: { event, props } }));
  if (client) client.capture(event, props);
  else if (waiting.length < 20) waiting.push({ event, props, at: new Date() });
}

/** Called when the shopper allows analytics: loads PostHog, or switches it back on. */
export function startTracking() {
  if (!KEY) return;
  if (client) {
    if (client.has_opted_out_capturing()) client.opt_in_capturing();
    return;
  }
  if (starting) return;
  starting = true;
  import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(KEY, {
        api_host: HOST,
        // PostHog's current recommended behaviour, including a page view on each in-site page change.
        defaults: "2026-08-30",
        // Shoppers are never named, so their visits stay anonymous.
        person_profiles: "identified_only",
      });
      client = posthog;
      // They may have changed their mind while it loaded, or said no on an earlier visit.
      if (!allowed()) {
        stopTracking();
        return;
      }
      if (posthog.has_opted_out_capturing()) posthog.opt_in_capturing();
      for (const w of waiting.splice(0)) posthog.capture(w.event, w.props, { timestamp: w.at });
    })
    .catch(() => {
      starting = false;
    });
}

/** Called when the shopper says no to analytics: stops sending and recording on the open page too. */
export function stopTracking() {
  waiting.length = 0;
  client?.opt_out_capturing();
}
