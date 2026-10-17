"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { CloseIcon } from "@/components/icons";
import { Sheet } from "@/components/sheet";
import { Switch } from "@/components/switch";

type Prefs = { analytics: boolean; marketing: boolean; preferences: boolean };

const STORAGE_KEY = "cookie-consent";

const CATEGORIES: { key: keyof Prefs; name: string; desc: string }[] = [
  { key: "analytics", name: "Analytics", desc: "Help us see which pages and products people use, so we can improve them." },
  { key: "marketing", name: "Marketing", desc: "Let us and our advertising partners show you relevant ads elsewhere." },
  { key: "preferences", name: "Preferences", desc: "Remember choices such as your country and currency." },
];

const all = (v: boolean): Prefs => ({ analytics: v, marketing: v, preferences: v });

declare global {
  interface Window {
    Shopify?: {
      customerPrivacy?: {
        setTrackingConsent: (
          consent: { analytics: boolean; marketing: boolean; preferences: boolean; sale_of_data: boolean },
          callback: () => void,
        ) => void;
      };
    };
  }
}

const CHANGE_EVENT = "cookie-consent-change";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function parse(raw: string): Prefs | null {
  try {
    return raw ? (JSON.parse(raw) as Prefs) : null;
  } catch {
    return null;
  }
}

/** Saves the choice and passes it to Shopify's Customer Privacy API when that is loaded on the page. */
function apply(prefs: Prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
  window.Shopify?.customerPrivacy?.setTrackingConsent({ ...prefs, sale_of_data: prefs.marketing }, () => {});
}

export function CookieConsent() {
  // "pending" while rendering on the server, where the choice can't be read.
  const raw = useSyncExternalStore(subscribe, readStored, () => "pending");
  const stored = raw === "pending" ? null : parse(raw);
  const [view, setView] = useState<"closed" | "prefs" | "saved">("closed");

  useEffect(() => {
    const openPrefs = () => setView("prefs");
    window.addEventListener("open-cookie-settings", openPrefs);
    return () => window.removeEventListener("open-cookie-settings", openPrefs);
  }, []);

  useEffect(() => {
    if (view !== "saved") return;
    const timer = setTimeout(() => setView("closed"), 6000);
    return () => clearTimeout(timer);
  }, [view]);

  const choose = (next: Prefs) => {
    apply(next);
    setView("saved");
  };

  const showBanner = raw !== "pending" && !stored && view === "closed";
  const buttonPaper = "h-12 cursor-pointer bg-paper px-7 text-[13px] font-semibold tracking-[0.14em] text-ink uppercase";

  return (
    <>
      {showBanner && (
        <section aria-labelledby="ck-title" className="fixed inset-x-0 bottom-0 z-40 bg-ink text-paper">
          <div className="page-x flex flex-wrap items-center justify-between gap-x-16 gap-y-5 py-6 md:py-8">
            <div className="flex max-w-[760px] flex-[1_1_560px] flex-col gap-2">
              <h2 id="ck-title" className="font-display text-[24px] leading-[1.2] md:text-[26px]">
                Cookies
              </h2>
              <p className="text-[14px] leading-[1.6] text-night-soft md:text-[15px]">
                We use essential cookies to run the shop. With your permission, we’d also use analytics cookies to see how the site is used and marketing
                cookies to show you relevant ads. You can change your mind at any time from the footer.{" "}
                <Link href="/policies/privacy-policy" className="text-paper underline-offset-4 hover:text-paper">
                  Cookie policy
                </Link>
              </p>
            </div>
            <div className="grid w-full grid-cols-2 items-center gap-x-4 gap-y-3 md:flex md:w-auto md:flex-wrap">
              <button
                type="button"
                onClick={() => setView("prefs")}
                className="col-span-2 min-h-12 cursor-pointer px-2 text-[14px] text-paper underline underline-offset-4 md:col-auto"
              >
                Manage preferences
              </button>
              <button type="button" onClick={() => choose(all(false))} className={buttonPaper}>
                Reject all
              </button>
              <button type="button" onClick={() => choose(all(true))} className={buttonPaper}>
                Accept all
              </button>
            </div>
          </div>
        </section>
      )}

      <Sheet
        open={view === "prefs"}
        onClose={() => setView("closed")}
        placement="center"
        className="md:mt-[90px] md:mb-auto md:w-[640px]"
        aria-labelledby="pref-title"
      >
        <PrefsPanel
          initial={stored ?? all(false)}
          onClose={() => setView("closed")}
          onSave={choose}
        />
      </Sheet>

      {view === "saved" && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between gap-5 bg-ink py-3.5 pr-4 pl-5 text-[14px] text-paper md:right-auto md:bottom-10 md:left-12"
        >
          <span>Your cookie choices are saved.</span>
          <button type="button" onClick={() => setView("prefs")} className="min-h-9 cursor-pointer px-1 text-paper underline underline-offset-4">
            Change
          </button>
        </div>
      )}
    </>
  );
}

function PrefsPanel({ initial, onClose, onSave }: { initial: Prefs; onClose: () => void; onSave: (prefs: Prefs) => void }) {
  const [prefs, setPrefs] = useState(initial);
  const outline = "h-[52px] cursor-pointer border border-ink text-[13px] font-semibold tracking-[0.14em] uppercase";

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-line py-4 pr-2 pl-4 md:py-5 md:pr-6 md:pl-10">
        <h2 id="pref-title" className="font-display text-[26px] leading-[1.2] md:text-[28px]">
          Cookie preferences
        </h2>
        <button type="button" aria-label="Close preferences" onClick={onClose} className="inline-flex size-11 items-center justify-center">
          <CloseIcon />
        </button>
      </div>
      <ul className="px-4 py-2 md:px-10">
        <li className="flex items-center justify-between gap-6 border-b border-line py-5">
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-medium">Strictly necessary</span>
            <span className="text-[14px] text-ink-2">Keep the shop working: your bag, checkout and security.</span>
          </div>
          <span className="flex-none text-[13px] text-ink-2">Always on</span>
        </li>
        {CATEGORIES.map((c) => (
          <li key={c.key} className="flex items-center justify-between gap-6 border-b border-line py-5">
            <div className="flex flex-col gap-1">
              <span id={`ck-${c.key}`} className="text-[15px] font-medium">
                {c.name}
              </span>
              <span className="text-[14px] text-ink-2">{c.desc}</span>
            </div>
            <Switch checked={prefs[c.key]} labelledBy={`ck-${c.key}`} onChange={(on) => setPrefs({ ...prefs, [c.key]: on })} />
          </li>
        ))}
      </ul>
      <div className="grid gap-3 px-4 pt-6 pb-8 md:grid-cols-3 md:px-10">
        <button type="button" onClick={() => onSave(all(false))} className={outline}>
          Reject all
        </button>
        <button type="button" onClick={() => onSave(all(true))} className={outline}>
          Accept all
        </button>
        <button type="button" onClick={() => onSave(prefs)} className="btn btn-ink h-[52px]">
          Save choices
        </button>
      </div>
    </div>
  );
}
