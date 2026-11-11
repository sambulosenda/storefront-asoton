"use client";

import { useEffect, useSyncExternalStore } from "react";
import { parse, readStored, subscribe } from "@/components/cookie-consent";
import { track, type TrackProps } from "@/lib/track";

/**
 * Records that a page's subject was seen: a piece, or a search and how much it found.
 * Once each time the subject changes, and once more if the shopper allows analytics while on the
 * page, so the page they landed on counts too.
 */
export function TrackView({ event, props }: { event: string; props: TrackProps }) {
  const allowed = useSyncExternalStore(
    subscribe,
    () => !!parse(readStored())?.analytics,
    () => false,
  );
  const key = JSON.stringify(props);
  useEffect(() => {
    if (allowed) track(event, JSON.parse(key) as TrackProps);
  }, [event, key, allowed]);
  return null;
}
