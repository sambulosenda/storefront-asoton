"use client";

import { useActionState, useEffect, useId, useState, useSyncExternalStore, type CSSProperties } from "react";
import { variantLabel } from "@/components/cart-drawer";
import { ProductVisual } from "@/components/cloth";
import { AlertIcon, HeartIcon } from "@/components/icons";
import { useStore } from "@/components/store-provider";
import { notifyAction } from "@/lib/actions";
import { swatchColour } from "@/lib/filters";
import { formatMoney, isColourOption, isSizeOption } from "@/lib/format";
import { arrivalDate, isPurchaseOption, makeDays, purchaseKind, sentenceCase, type DeliveryPlan } from "@/lib/purchase";
import { sizeName, sortedSizes } from "@/lib/sizes";
import type { Image, ProductDetail } from "@/lib/shopify/types";

type Option = ProductDetail["options"][number];

/** Colour, size, add to bag, back-in-stock and wishlist. */
export function ProductForm({
  product,
  dept,
  model,
  delivery,
}: {
  product: ProductDetail;
  dept: "women" | "men";
  model: string | null;
  delivery: DeliveryPlan;
}) {
  const { add, open, openSizeGuide } = useStore();
  const id = useId();
  const options = product.options.filter((o) => !(o.optionValues.length === 1 && o.optionValues[0].name === "Default Title"));
  const colourOption = options.find((o) => isColourOption(o.name));
  const sizeOption = options.find((o) => isSizeOption(o.name));
  const purchaseOption = options.find((o) => isPurchaseOption(o.name));
  const otherOptions = options.filter((o) => o !== colourOption && o !== sizeOption && o !== purchaseOption);

  const firstAvailable = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  const initial: Record<string, string> = {};
  for (const o of options) {
    // Size is left for the customer to choose, unless there is only one.
    if (o === sizeOption && o.optionValues.length > 1) continue;
    initial[o.name] = firstAvailable?.selectedOptions.find((s) => s.name === o.name)?.value ?? o.optionValues[0].name;
  }
  const [selection, setSelection] = useState(initial);
  const [status, setStatus] = useState<{ kind: "prompt" | "added" | "error"; text: string } | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const matches = (values: Record<string, string>) =>
    product.variants.find((v) => options.every((o) => v.selectedOptions.find((s) => s.name === o.name)?.value === values[o.name]));
  const complete = options.every((o) => selection[o.name]);
  const variant = complete ? matches(selection) : undefined;
  // Every option is chosen but the product has no variant for that combination.
  const unavailable = complete && !variant;
  const price = variant?.price ?? product.priceRange.minVariantPrice;
  const size = sizeOption ? selection[sizeOption.name] : undefined;
  const soldOut = variant ? !variant.availableForSale : false;
  // Buttons show the short UK size in size order; the value Shopify holds still picks the variant.
  const sizes = sizeOption ? sortedSizes(sizeOption.optionValues.map((v) => v.name)) : [];
  const chosen = sizes.find((s) => s.value === size);
  const compact = sizes.every((s) => s.short.length <= 6);
  const converts = sizes.some((s) => s.extra);

  const isAvailable = (option: Option, value: string) => {
    const v = matches({ ...selection, [option.name]: value });
    return v ? v.availableForSale : false;
  };

  const pick = (name: string, value: string) => {
    setSelection((s) => ({ ...s, [name]: value }));
    setStatus(null);
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const addToBag = async () => {
    if (!variant) {
      setStatus({ kind: "prompt", text: `Choose a ${sizeOption ? "size" : "option"} to continue.` });
      return;
    }
    setAdding(true);
    setStatus(null);
    const failed = "We couldn’t add this to your bag. Check your connection and try again.";
    let result: Awaited<ReturnType<typeof add>>;
    try {
      result = await add(variant.id);
    } catch {
      result = { cart: null, error: failed };
    } finally {
      setAdding(false);
    }
    if (result.error || !result.cart) {
      setStatus({ kind: "error", text: result.error ?? failed });
      return;
    }
    const label = variantLabel(variant.selectedOptions);
    setStatus({
      kind: "added",
      text: size && colourOption ? `${sizeName(size)} in ${selection[colourOption.name]} added to your bag.` : `${product.title} added to your bag.`,
    });
    setToast([product.title, label].filter(Boolean).join(" · "));
  };

  const ctaLabel = adding
    ? "Adding…"
    : status?.kind === "error"
      ? "Try again"
      : status?.kind === "added"
        ? "Added to bag"
        : unavailable
          ? "Unavailable"
          : variant || !sizeOption
            ? "Add to bag"
            : "Select a size";

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-0.5 md:flex-row md:flex-wrap md:items-baseline md:gap-x-3 md:gap-y-1">
        <span className="text-[18px] md:text-[20px]">{formatMoney(price)}</span>
        {variant?.compareAtPrice && Number(variant.compareAtPrice.amount) > Number(price.amount) && (
          <s className="text-[15px] text-ink-2">{formatMoney(variant.compareAtPrice)}</s>
        )}
        <span className="text-[12px] text-ink-2 md:text-[13px]">Tax included. Shipping calculated at checkout.</span>
      </div>

      {colourOption && (
        <div className="flex flex-col gap-2.5 md:gap-3">
          <span id={`${id}-colour`} className="text-[13px] md:tracking-[0.06em]">
            <span className="text-[11px] font-semibold tracking-[0.14em] uppercase md:text-[12px]">Colour</span> — {selection[colourOption.name]}
          </span>
          <div role="group" aria-labelledby={`${id}-colour`} className="flex flex-wrap gap-2">
            {colourOption.optionValues.map((v) => {
              const on = selection[colourOption.name] === v.name;
              return (
                <button
                  key={v.name}
                  type="button"
                  aria-label={v.name}
                  aria-pressed={on}
                  onClick={() => pick(colourOption.name, v.name)}
                  className={`inline-flex size-11 cursor-pointer items-center justify-center rounded-full border ${on ? "border-ink" : "border-transparent"}`}
                >
                  <span className="size-[30px] rounded-full" style={{ backgroundColor: swatchColour(v.name, v.swatch?.color) }} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {purchaseOption && (
        <PurchaseChoice
          option={purchaseOption}
          selected={selection[purchaseOption.name]}
          onPick={(value) => pick(purchaseOption.name, value)}
          delivery={delivery}
        />
      )}

      {sizeOption && (
        <div className="flex flex-col gap-2.5 md:gap-3">
          <div className="flex items-center justify-between gap-4 md:items-baseline">
            <span
              id={`${id}-size`}
              className={`text-[11px] font-semibold tracking-[0.14em] uppercase md:text-[12px] ${status?.kind === "prompt" ? "text-error" : ""}`}
            >
              {sizes.some((s) => s.full.startsWith("UK ")) ? "Size (UK)" : "Size"}
            </span>
            <button
              type="button"
              onClick={() => openSizeGuide(dept)}
              className="inline-flex min-h-11 cursor-pointer items-center text-[13px] underline underline-offset-4 md:min-h-0 md:py-2"
            >
              Size guide
            </button>
          </div>
          <div
            role="group"
            aria-labelledby={`${id}-size`}
            style={{ "--cols": Math.min(sizes.length, 8) } as CSSProperties}
            className={compact ? "grid grid-cols-4 gap-2 md:grid-cols-[repeat(var(--cols),minmax(0,1fr))]" : "flex flex-wrap gap-2"}
          >
            {sizes.map((s) => {
              const on = size === s.value;
              const out = !isAvailable(sizeOption, s.value);
              return (
                <button
                  key={s.value}
                  type="button"
                  aria-pressed={on}
                  aria-label={`${s.full}${s.extra ? `, ${s.extra.replaceAll(" · ", ", ")}` : ""}${out ? ", sold out" : ""}`}
                  onClick={() => pick(sizeOption.name, s.value)}
                  className={`h-12 cursor-pointer border text-[14px] ${compact ? "" : "px-4"} ${
                    on && !out
                      ? "border-ink bg-ink text-paper"
                      : on
                        ? "border-ink text-muted line-through"
                        : out
                          ? "border-line-soft text-ink-2 line-through"
                          : "border-line hover:border-ink"
                  }`}
                >
                  {s.short}
                </button>
              );
            })}
          </div>
          {converts && (
            <p className="text-[13px] text-ink-2">
              {chosen?.extra ? `${chosen.full} is ${chosen.extra.replace(" · ", " and ")}.` : "Sizes are UK. Choose one to see its US and EU size."}
            </p>
          )}
          {model && <p className="text-[13px] text-ink-2">{model}</p>}
        </div>
      )}

      {otherOptions.map((o, i) => (
        <div key={o.name} className="flex flex-col gap-2.5 md:gap-3">
          <span id={`${id}-opt-${i}`} className="text-[11px] font-semibold tracking-[0.14em] uppercase md:text-[12px]">
            {sentenceCase(o.name)}
          </span>
          <div role="group" aria-labelledby={`${id}-opt-${i}`} className="flex flex-wrap gap-2">
            {o.optionValues.map((v) => {
              const on = selection[o.name] === v.name;
              return (
                <button
                  key={v.name}
                  type="button"
                  aria-pressed={on}
                  onClick={() => pick(o.name, v.name)}
                  className={`h-12 cursor-pointer border px-4 text-[14px] ${on ? "border-ink bg-ink text-paper" : "border-line"}`}
                >
                  {sentenceCase(v.name)}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-2 md:gap-2.5">
        {soldOut && variant ? (
          <NotifyPanel key={variant.id} label={size ? sizeName(size) : product.title} />
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addToBag}
              disabled={adding || unavailable || !product.availableForSale}
              className="btn btn-ink h-14 flex-1 gap-2.5 px-4 disabled:opacity-60"
            >
              {product.availableForSale ? ctaLabel : "Sold out"}
            </button>
            <WishlistButton handle={product.handle} />
          </div>
        )}
        <p
          role="status"
          className={`flex min-h-5 items-start gap-2.5 text-[13px] ${status?.kind === "prompt" || status?.kind === "error" ? "text-error" : ""}`}
        >
          {status?.kind === "error" && <AlertIcon size={18} className="mt-px flex-none" />}
          {status?.text}
        </p>
      </div>

      {toast && (
        <div className="fixed inset-x-4 bottom-4 z-30 flex items-center gap-4 bg-ink p-4 text-paper md:hidden">
          <div className="relative flex h-16 w-12 flex-none items-center justify-center overflow-hidden bg-stone">
            <ProductVisual product={product} image={product.featuredImage as Image | null} sizes="48px" drawingWidth="84%" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[14px] font-medium">Added to your bag</span>
            <span className="truncate text-[13px] text-night-soft">{toast}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setToast(null);
              open("cart");
            }}
            className="min-h-11 cursor-pointer px-2 text-[13px] font-semibold tracking-[0.14em] text-paper uppercase underline underline-offset-4"
          >
            View bag
          </button>
        </div>
      )}
    </div>
  );
}

const noSubscribe = () => () => {};
const currentMinute = () => Math.floor(Date.now() / 60_000);
const noMinute = () => null;

/** "How would you like it?": ready to ship or made to order, each with when it should arrive. */
function PurchaseChoice({
  option,
  selected,
  onPick,
  delivery,
}: {
  option: Option;
  selected: string | undefined;
  onPick: (value: string) => void;
  delivery: DeliveryPlan;
}) {
  const id = useId();
  // Arrival dates depend on today, so they're worked out in the browser.
  const minute = useSyncExternalStore(noSubscribe, currentMinute, noMinute);
  const now = minute === null ? null : new Date(minute * 60_000);

  const cards = option.optionValues.map((v) => {
    const kind = purchaseKind(v.name);
    const title = kind === "ready" ? "Ready to ship" : kind === "made" ? "Made to order" : sentenceCase(v.name);
    const line = kind === "ready" ? delivery.dispatchLine : kind === "made" ? `Made to your size in ${makeDays(v.name)} days` : null;
    const arrives = now && kind !== "other" ? arrivalDate(kind, v.name, delivery, now) : null;
    return { value: v.name, title, line, arrives: arrives && (kind === "made" ? `Arrives about ${arrives}` : `Arrives ${arrives}`) };
  });
  const body = (c: (typeof cards)[number]) => (
    <>
      <span className="text-[15px] font-medium">{c.title}</span>
      {c.line && <span className="text-[13px] text-ink-2">{c.line}</span>}
      {/* Kept as a line so the card doesn't grow once the date arrives. */}
      <span className="min-h-5 text-[13px] text-ink-2">{c.arrives}</span>
    </>
  );

  return (
    <div className="flex flex-col gap-2.5 md:gap-3">
      <span id={id} className="text-[11px] font-semibold tracking-[0.14em] uppercase md:text-[12px]">
        How would you like it?
      </span>
      {cards.length === 1 ? (
        // One way to buy it: shown as information, not a choice.
        <div className="flex flex-col gap-0.5 border border-ink p-4">{body(cards[0])}</div>
      ) : (
        <div role="group" aria-labelledby={id} className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-2">
          {cards.map((c) => {
            const on = selected === c.value;
            return (
              <button
                key={c.value}
                type="button"
                aria-pressed={on}
                onClick={() => onPick(c.value)}
                className={`flex cursor-pointer flex-col gap-0.5 border p-4 text-left ${on ? "border-ink outline-1 outline-ink -outline-offset-2" : "border-line hover:border-ink"}`}
              >
                {body(c)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NotifyPanel({ label }: { label: string }) {
  const [state, formAction, pending] = useActionState(notifyAction, null);
  const id = useId();
  return (
    <form key={state?.values?.email} action={formAction} noValidate className="flex flex-col gap-3 bg-stone p-4 md:p-5">
      <p className="text-[14px] leading-[1.5] md:text-[15px]">
        <strong className="font-medium">{label} is sold out.</strong> <span className="text-ink-2">We’ll email you once, when it’s back.</span>
      </p>
      <label htmlFor={`${id}-email`} className="sr-only">
        Email address
      </label>
      <div className="flex flex-col gap-3 md:flex-row md:gap-2">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state?.values?.email}
          placeholder="Email address"
          className="h-[52px] min-w-0 flex-1 border border-line bg-white px-3.5 md:h-14 md:px-4"
        />
        <button type="submit" disabled={pending} className="btn btn-ink h-[52px] md:h-14 md:px-6">
          Notify me
        </button>
      </div>
      {state && (
        <p role="status" className={`text-[13px] ${state.ok ? "" : "text-error"}`}>
          {state.ok ? `Done. We’ll email you when ${label} is back.` : state.message}
        </p>
      )}
    </form>
  );
}

const WISHLIST_KEY = "wishlist";
const WISHLIST_EVENT = "wishlist-change";

function readWishlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function subscribeWishlist(onChange: () => void) {
  window.addEventListener(WISHLIST_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(WISHLIST_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Saved pieces are kept in this browser until customer accounts hold a wishlist. */
function WishlistButton({ handle }: { handle: string }) {
  const saved = useSyncExternalStore(
    subscribeWishlist,
    () => readWishlist().includes(handle),
    () => false,
  );

  const toggle = () => {
    const list = readWishlist().filter((h) => h !== handle);
    if (!saved) list.push(handle);
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    } catch {}
    window.dispatchEvent(new Event(WISHLIST_EVENT));
  };

  return (
    <button
      type="button"
      aria-label="Save to wishlist"
      aria-pressed={saved}
      onClick={toggle}
      className="inline-flex size-14 flex-none cursor-pointer items-center justify-center border border-line hover:border-ink"
    >
      <HeartIcon fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
