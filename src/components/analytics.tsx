"use client";

import { useEffect, useSyncExternalStore } from "react";
import { parse, readStored, subscribe } from "@/components/cookie-consent";

/** The GA4 measurement ID ("G-XXXXXXX"). Without it, nothing loads. */
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics 4, only after the shopper says yes to analytics cookies in the cookie banner.
 * Consent Mode starts with everything denied, then follows the banner, so a later "no" stops it too.
 * GA4's own page-change tracking counts the in-site page views.
 */
export function Analytics() {
  const raw = useSyncExternalStore(subscribe, readStored, () => "");
  const prefs = parse(raw);
  const analytics = !!prefs?.analytics;
  const marketing = !!prefs?.marketing;

  useEffect(() => {
    if (!GA_ID) return;
    const consent = {
      analytics_storage: analytics ? "granted" : "denied",
      ad_storage: marketing ? "granted" : "denied",
      ad_user_data: marketing ? "granted" : "denied",
      ad_personalization: marketing ? "granted" : "denied",
    };
    if (window.gtag) {
      window.gtag("consent", "update", consent);
      return;
    }
    // Load only once the shopper has allowed analytics.
    if (!analytics) return;
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = function gtag() {
      // gtag.js reads the arguments object itself, so it must be pushed as is.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("consent", "default", consent);
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(script);
  }, [analytics, marketing]);

  return null;
}
