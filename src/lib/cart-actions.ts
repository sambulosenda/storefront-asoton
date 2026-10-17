"use server";

import { cookies } from "next/headers";
import { cartFields, cartQueries, shopifyFetch, type Cart } from "@/lib/shopify";

const CART_COOKIE = "cart_id";

type RawCart = Omit<Cart, "lines"> & { lines: { nodes: Cart["lines"] } };
type MutationResult = { cart: RawCart | null; userErrors: { message: string }[] };

export type CartResult = { cart: Cart | null; error: string | null };

function normalize(cart: RawCart | null): Cart | null {
  return cart ? { ...cart, lines: cart.lines.nodes } : null;
}

async function cartId() {
  return (await cookies()).get(CART_COOKIE)?.value ?? null;
}

async function saveCartId(id: string) {
  (await cookies()).set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

const NETWORK_ERROR = "We couldn’t update your bag. Check your connection and try again.";

export async function getCart(): Promise<Cart | null> {
  const id = await cartId();
  if (!id) return null;
  try {
    const data = await shopifyFetch<{ cart: RawCart | null }>(cartFields + cartQueries.get, {
      cartId: id,
    });
    return normalize(data.cart);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function addToCart(merchandiseId: string, quantity = 1): Promise<CartResult> {
  const lines = [{ merchandiseId, quantity }];
  try {
    const id = await cartId();
    if (id) {
      const data = await shopifyFetch<{ cartLinesAdd: MutationResult }>(
        cartFields + cartQueries.add,
        { cartId: id, lines },
      );
      // An expired or completed cart comes back null: start a fresh one.
      if (data.cartLinesAdd.cart) return result(data.cartLinesAdd);
    }
    const data = await shopifyFetch<{ cartCreate: MutationResult }>(
      cartFields + cartQueries.create,
      { lines },
    );
    if (data.cartCreate.cart) await saveCartId(data.cartCreate.cart.id);
    return result(data.cartCreate);
  } catch (error) {
    console.error(error);
    return { cart: null, error: "We couldn’t add this to your bag. Check your connection and try again." };
  }
}

export async function updateCartLine(lineId: string, quantity: number): Promise<CartResult> {
  const id = await cartId();
  if (!id) return { cart: null, error: NETWORK_ERROR };
  try {
    if (quantity <= 0) {
      const data = await shopifyFetch<{ cartLinesRemove: MutationResult }>(
        cartFields + cartQueries.remove,
        { cartId: id, lineIds: [lineId] },
      );
      return result(data.cartLinesRemove);
    }
    const data = await shopifyFetch<{ cartLinesUpdate: MutationResult }>(
      cartFields + cartQueries.update,
      { cartId: id, lines: [{ id: lineId, quantity }] },
    );
    return result(data.cartLinesUpdate);
  } catch (error) {
    console.error(error);
    return { cart: null, error: NETWORK_ERROR };
  }
}

function result({ cart, userErrors }: MutationResult): CartResult {
  return { cart: normalize(cart), error: userErrors[0]?.message ?? null };
}
