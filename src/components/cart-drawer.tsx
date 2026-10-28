"use client";

import Link from "next/link";
import { ProductVisual } from "@/components/cloth";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { Sheet } from "@/components/sheet";
import { useStore } from "@/components/store-provider";
import { formatMoney, isSizeOption } from "@/lib/format";
import { sizeName } from "@/lib/sizes";
import type { CartLine } from "@/lib/shopify/types";

export function variantLabel(options: { name: string; value: string }[]) {
  return options
    .filter((o) => o.value !== "Default Title")
    .map((o) => (isSizeOption(o.name) ? sizeName(o.value) : o.value))
    .join(" · ");
}

export function CartDrawer({ threshold, thresholdLabel }: { threshold: number | null; thresholdLabel: string }) {
  const { cart, overlay, close, notice } = useStore();
  const lines = cart?.lines ?? [];
  const count = cart?.totalQuantity ?? 0;
  const subtotal = cart ? Number(cart.cost.subtotalAmount.amount) : 0;
  const currency = cart?.cost.subtotalAmount.currencyCode ?? "GBP";
  const remaining = threshold ? Math.max(0, threshold - subtotal) : null;

  return (
    <Sheet open={overlay === "cart"} onClose={close} placement="right" aria-labelledby="bag-title">
      <div className="flex h-full flex-col">
        <div className="flex h-[60px] flex-none items-center justify-between gap-4 border-b border-line pr-2 pl-4 md:h-auto md:py-[18px] md:pr-5 md:pl-8">
          <h2 id="bag-title" className="flex items-baseline gap-2 font-display text-[24px] leading-[1.2] md:gap-2.5 md:text-[28px]">
            Your bag <span className="font-sans text-[14px] text-ink-2">({count})</span>
          </h2>
          <button type="button" aria-label="Close bag" onClick={close} className="inline-flex size-11 items-center justify-center">
            <CloseIcon />
          </button>
        </div>

        {lines.length > 0 ? (
          <>
            {remaining !== null && (
              <div className="flex flex-none flex-col gap-2 border-b border-line px-4 py-3.5 md:gap-2.5 md:px-8 md:py-5">
                <p className="text-[13px]">
                  {remaining > 0
                    ? `You’re ${formatMoney({ amount: String(remaining), currencyCode: currency })} away from complimentary UK delivery.`
                    : "Your order qualifies for complimentary UK delivery."}
                </p>
                <div aria-hidden="true" className="relative h-0.5 bg-line">
                  <div
                    className="absolute inset-y-0 left-0 bg-ink"
                    style={{ width: `${Math.min(100, (subtotal / threshold!) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            {remaining === null && (
              <div className="flex-none border-b border-line px-4 py-3.5 text-[13px] md:px-8 md:py-5">
                Complimentary UK delivery on orders over {thresholdLabel}.
              </div>
            )}

            <div className="min-h-0 flex-auto overflow-y-auto px-4 md:px-8">
              {notice && (
                <p role="status" className="mt-6 bg-stone px-4 py-3 text-[14px]">
                  {notice}
                </p>
              )}
              <ul>
                {lines.map((line) => (
                  <CartLineRow key={line.id} line={line} />
                ))}
              </ul>
            </div>

            <div className="flex flex-none flex-col gap-2.5 border-t border-line px-4 pt-4 pb-7 md:gap-3 md:px-8 md:pt-6">
              <div className="flex items-baseline justify-between gap-4">
                <span className="label-caps">Subtotal</span>
                <span className="text-[18px]">{cart && formatMoney(cart.cost.subtotalAmount)}</span>
              </div>
              <p className="text-[12px] text-ink-2 md:text-[13px]">Tax included. Delivery and discount codes are added at checkout.</p>
              <a href={cart?.checkoutUrl} className="btn btn-ink mt-1 h-14 md:mt-2">
                Checkout
              </a>
              <Link
                href="/collections/new-in"
                onClick={close}
                className="hidden min-h-11 items-center self-center text-[13px] underline-offset-4 md:inline-flex"
              >
                Continue shopping
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3.5 p-6 text-center md:gap-4 md:p-8">
            <p className="font-display text-[30px] leading-[1.1] md:text-[32px]">Your bag is empty</p>
            <p className="max-w-[300px] text-[15px] leading-[1.6] text-ink-2">
              Start with the cloth: adire, kente, aso-oke, bògòlan and wax print.
            </p>
            <Link href="/collections/new-in" onClick={close} className="btn btn-outline mt-2 self-stretch md:self-auto">
              Shop new in
            </Link>
          </div>
        )}
      </div>
    </Sheet>
  );
}

function CartLineRow({ line }: { line: CartLine }) {
  const { setQuantity, close } = useStore();
  const { merchandise } = line;
  const href = `/products/${merchandise.product.handle}`;
  // Stores that don't track stock (or keep selling when out) report 0 available, so only a positive count caps it.
  const atMax = merchandise.quantityAvailable !== null && merchandise.quantityAvailable > 0 && line.quantity >= merchandise.quantityAvailable;

  return (
    <li className="grid grid-cols-[84px_minmax(0,1fr)] gap-4 border-b border-line py-5 md:grid-cols-[96px_minmax(0,1fr)] md:gap-5 md:py-6">
      <Link
        href={href}
        onClick={close}
        aria-label={merchandise.product.title}
        className="relative flex h-28 items-center justify-center overflow-hidden bg-stone md:h-32"
      >
        <ProductVisual product={merchandise.product} image={merchandise.image} sizes="96px" drawingWidth="84%" />
      </Link>
      <div className="flex min-w-0 flex-col gap-0.5 md:gap-1">
        <div className="flex items-baseline justify-between gap-3 md:gap-4">
          <Link href={href} onClick={close} className="text-[14px] font-medium no-underline md:text-[15px]">
            {merchandise.product.title}
          </Link>
          <span className="text-[14px] whitespace-nowrap md:text-[15px]">{formatMoney(line.cost.totalAmount)}</span>
        </div>
        <span className="text-[13px] text-ink-2">{variantLabel(merchandise.selectedOptions)}</span>
        <div className="mt-auto flex items-center justify-between gap-3 md:gap-4">
          <div role="group" aria-label="Quantity" className="inline-flex items-center border border-line">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity(line.id, line.quantity - 1)}
              className="inline-flex size-11 items-center justify-center"
            >
              <MinusIcon size={16} />
            </button>
            <span aria-live="polite" className="min-w-6 text-center text-[14px] md:min-w-7">
              {line.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={atMax}
              onClick={() => setQuantity(line.id, line.quantity + 1)}
              className="inline-flex size-11 items-center justify-center disabled:text-muted"
            >
              <PlusIcon size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setQuantity(line.id, 0)}
            className="min-h-11 cursor-pointer text-[13px] text-ink-2 underline underline-offset-4"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
