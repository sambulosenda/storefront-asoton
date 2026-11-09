"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  type ReactNode,
} from "react";
import { addToCart, getCart, setCountry, updateCartLine, type CartResult } from "@/lib/cart-actions";
import type { Market } from "@/lib/shopify";
import type { Cart } from "@/lib/shopify/types";

export type SizeGuideSizes = { chosen?: string; offered?: string[] };

export type Overlay = "cart" | "search" | "menu" | "size-guide" | "market" | null;

const COUNTRY_EVENT = "country-change";

function subscribeCountry(onChange: () => void) {
  window.addEventListener(COUNTRY_EVENT, onChange);
  return () => window.removeEventListener(COUNTRY_EVENT, onChange);
}

function readCountry() {
  return document.cookie.match(/(?:^|; )country=([A-Z]{2})/)?.[1] ?? null;
}

/** "loading" until the first fetch of the bag answers; "failed" if it never reached the server. */
export type CartStatus = "loading" | "ready" | "failed";

const NETWORK_ERROR = "We couldn’t update your bag. Check your connection and try again.";

type Store = {
  cart: Cart | null;
  cartStatus: CartStatus;
  loadCart: () => void;
  /** True while a quantity change is saving. */
  pending: boolean;
  notice: string | null;
  add: (variantId: string) => Promise<CartResult>;
  setQuantity: (lineId: string, quantity: number) => void;
  overlay: Overlay;
  open: (overlay: Exclude<Overlay, null>) => void;
  close: () => void;
  sizeGuideDept: "women" | "men";
  /** From a product page: the size chosen ("UK 14") and the sizes the piece comes in, for the chart. */
  sizeGuideSizes: SizeGuideSizes;
  openSizeGuide: (dept?: "women" | "men", sizes?: SizeGuideSizes) => void;
  /** Countries the store sells to, and the one prices are shown in. */
  markets: Market[];
  market: Market | null;
  chooseCountry: (code: string) => void;
  /** True while the shop switches to another country. */
  switchingCountry: boolean;
  /** Set when a country switch failed, shown in the country list. */
  countryError: string | null;
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
  const [cartStatus, setCartStatus] = useState<CartStatus>("loading");
  const [countryError, setCountryError] = useState<string | null>(null);
  // One quantity change saves at a time, so replies can't land out of order or roll back onto each other.
  const saving = useRef(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [sizeGuideDept, setSizeGuideDept] = useState<"women" | "men">("women");
  const [sizeGuideSizes, setSizeGuideSizes] = useState<SizeGuideSizes>({});
  const [pending, startTransition] = useTransition();
  const [switchingCountry, startSwitching] = useTransition();
  const code = useSyncExternalStore(subscribeCountry, readCountry, () => null);
  const market = markets.find((m) => m.isoCode === code) ?? defaultMarket;

  const fetchCart = useCallback(() => {
    getCart().then(
      (c) => {
        setCart(c);
        setCartStatus("ready");
      },
      () => setCartStatus("failed"),
    );
  }, []);

  useEffect(fetchCart, [fetchCart]);

  const loadCart = useCallback(() => {
    setCartStatus("loading");
    fetchCart();
  }, [fetchCart]);

  const add = useCallback(async (variantId: string) => {
    const result = await addToCart(variantId);
    if (result.cart) {
      setCart(result.cart);
      setCartStatus("ready");
    }
    return result;
  }, []);

  const setQuantity = useCallback(
    (lineId: string, quantity: number) => {
      if (saving.current) return;
      saving.current = true;
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
        let result: CartResult;
        try {
          result = await updateCartLine(lineId, quantity);
        } catch {
          // The request never reached the server (offline, or a deploy changed the action).
          result = { cart: null, error: NETWORK_ERROR };
        } finally {
          saving.current = false;
        }
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
    setCountryError(null);
    startSwitching(async () => {
      const failed = () => {
        setCountryError("We couldn’t change your country. Check your connection and try again.");
        setOverlay("market");
      };
      // Setting the cookie in the action re-renders the page with the new prices.
      let result: { ok: boolean };
      try {
        result = await setCountry(next);
      } catch {
        return failed();
      }
      if (!result.ok) return failed();
      window.dispatchEvent(new Event(COUNTRY_EVENT));
      try {
        setCart(await getCart());
      } catch {
        // The bag was moved on the server; it shows the new prices on the next load.
      }
    });
  }, []);

  const store = useMemo<Store>(
    () => ({
      cart,
      cartStatus,
      loadCart,
      pending,
      notice,
      add,
      setQuantity,
      overlay,
      open: setOverlay,
      close: () => setOverlay(null),
      sizeGuideDept,
      sizeGuideSizes,
      openSizeGuide: (dept, sizes) => {
        if (dept) setSizeGuideDept(dept);
        setSizeGuideSizes(sizes ?? {});
        setOverlay("size-guide");
      },
      markets,
      market,
      chooseCountry,
      switchingCountry,
      countryError,
    }),
    [
      cart,
      cartStatus,
      loadCart,
      pending,
      notice,
      add,
      setQuantity,
      overlay,
      sizeGuideDept,
      sizeGuideSizes,
      markets,
      market,
      chooseCountry,
      switchingCountry,
      countryError,
    ],
  );

  return <StoreContext value={store}>{children}</StoreContext>;
}
