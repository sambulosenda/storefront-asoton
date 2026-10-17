"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { addToCart, getCart, updateCartLine, type CartResult } from "@/lib/cart-actions";
import type { Cart } from "@/lib/shopify/types";

export type Overlay = "cart" | "search" | "menu" | "size-guide" | null;

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
};

const StoreContext = createContext<Store | null>(null);

export function useStore() {
  const store = use(StoreContext);
  if (!store) throw new Error("useStore must be used within StoreProvider");
  return store;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [sizeGuideDept, setSizeGuideDept] = useState<"women" | "men">("women");
  const [pending, startTransition] = useTransition();

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
    }),
    [cart, pending, notice, add, setQuantity, overlay, sizeGuideDept],
  );

  return <StoreContext value={store}>{children}</StoreContext>;
}
