"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  useTransition,
  type ReactNode,
} from "react";
import { addToCart, getCart, setCountry, updateCartLine, type CartResult } from "@/lib/cart-actions";
import type { Market } from "@/lib/shopify";
import type { Cart } from "@/lib/shopify/types";

export type Overlay = "cart" | "search" | "menu" | "size-guide" | "market" | null;

const COUNTRY_EVENT = "country-change";

function subscribeCountry(onChange: () => void) {
  window.addEventListener(COUNTRY_EVENT, onChange);
  return () => window.removeEventListener(COUNTRY_EVENT, onChange);
}

function readCountry() {
  return document.cookie.match(/(?:^|; )country=([A-Z]{2})/)?.[1] ?? null;
}

type Store = {
  cart: Cart | null;
  /** True while a quantity change is saving. */
  pending: boolean;
  notice: string | null;
  add: (variantId: string) => Promise<CartResult>;
  setQuantity: (lineId: string, quantity: number) => void;
  overlay: Overlay;
  open: (overlay: Exclude<Overlay, null>) => void;
  close: () => void;
  sizeGuideDept: "women" | "men";
  openSizeGuide: (dept?: "women" | "men") => void;
  /** Countries the store sells to, and the one prices are shown in. */
  markets: Market[];
  market: Market | null;
  chooseCountry: (code: string) => void;
  /** True while the shop switches to another country. */
  switchingCountry: boolean;
};

const StoreContext = createContext<Store | null>(null);

export function useStore() {
  const store = use(StoreContext);
  if (!store) throw new Error("useStore must be used within StoreProvider");
  return store;
}

export function StoreProvider({
  children,
  markets,
  defaultMarket,
}: {
  children: ReactNode;
  markets: Market[];
  defaultMarket: Market | null;
}) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [sizeGuideDept, setSizeGuideDept] = useState<"women" | "men">("women");
  const [pending, startTransition] = useTransition();
  const [switchingCountry, startSwitching] = useTransition();
  const code = useSyncExternalStore(subscribeCountry, readCountry, () => null);
  const market = markets.find((m) => m.isoCode === code) ?? defaultMarket;

  useEffect(() => {
    getCart().then(setCart, () => {});
  }, []);

  const add = useCallback(async (variantId: string) => {
    const result = await addToCart(variantId);
    if (result.cart) setCart(result.cart);
    return result;
  }, []);

  const setQuantity = useCallback(
    (lineId: string, quantity: number) => {
      const previous = cart;
      // Update the bag first, then roll back if Shopify refuses.
      setCart((c) =>
        c && {
          ...c,
          totalQuantity: c.totalQuantity + quantity - (c.lines.find((l) => l.id === lineId)?.quantity ?? 0),
          lines: c.lines
            .map((l) => (l.id === lineId ? { ...l, quantity } : l))
            .filter((l) => l.quantity > 0),
        },
      );
      setNotice(null);
      startTransition(async () => {
        const result = await updateCartLine(lineId, quantity);
        if (result.cart) {
          setCart(result.cart);
          const line = result.cart.lines.find((l) => l.id === lineId);
          if (line && line.quantity < quantity) {
            const size = line.merchandise.selectedOptions.find((o) => /size/i.test(o.name))?.value;
            setNotice(`Only ${line.quantity} left${size ? ` in UK ${size}` : ""}. We’ve updated your bag.`);
          }
        } else {
          setCart(previous);
        }
        if (result.error && !result.cart) setNotice(result.error);
      });
    },
    [cart],
  );

  const chooseCountry = useCallback((next: string) => {
    startSwitching(async () => {
      // Setting the cookie in the action re-renders the page with the new prices.
      const result = await setCountry(next);
      if (!result.ok) return;
      window.dispatchEvent(new Event(COUNTRY_EVENT));
      setCart(await getCart());
    });
  }, []);

  const store = useMemo<Store>(
    () => ({
      cart,
      pending,
      notice,
      add,
      setQuantity,
      overlay,
      open: setOverlay,
      close: () => setOverlay(null),
      sizeGuideDept,
      openSizeGuide: (dept) => {
        if (dept) setSizeGuideDept(dept);
        setOverlay("size-guide");
      },
      markets,
      market,
      chooseCountry,
      switchingCountry,
    }),
    [cart, pending, notice, add, setQuantity, overlay, sizeGuideDept, markets, market, chooseCountry, switchingCountry],
  );

  return <StoreContext value={store}>{children}</StoreContext>;
}
