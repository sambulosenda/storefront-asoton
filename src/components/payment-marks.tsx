import type { ReactNode } from "react";

/*
 * Payment marks for the ways the store's Shopify checkout takes money.
 * Each is a 38×24 card, the size Shopify and most shops use. The brand glyphs
 * are the official marks (paths from Simple Icons, CC0), set in each brand's colour.
 * Change this list if a payment method is turned on or off in Shopify.
 */

const VISA =
  "M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z";
const PAYPAL =
  "M7.016 19.198h-4.2a.562.562 0 0 1-.555-.65L5.093.584A.692.692 0 0 1 5.776 0h7.222c3.417 0 5.904 2.488 5.846 5.5-.006.25-.027.5-.066.747A6.794 6.794 0 0 1 12.071 12H8.743a.69.69 0 0 0-.682.583l-.325 2.056-.013.083-.692 4.39-.015.087z";
const PAYPAL_BACK =
  "M19.79 6.142c-.01.087-.01.175-.023.261a7.76 7.76 0 0 1-7.695 6.598H9.007l-.283 1.795-.013.083-.692 4.39-.134.843-.014.088H6.86l-.497 3.15a.562.562 0 0 0 .555.65h3.612c.34 0 .63-.249.683-.585l.952-6.031a.692.692 0 0 1 .683-.584h2.126a6.793 6.793 0 0 0 6.707-5.752c.306-1.95-.466-3.744-1.89-4.906z";
const APPLE_PAY =
  "M6.86 8.53c-.3.016-.668.199-.88.456-.191.22-.36.58-.316.918.338.03.675-.169.888-.418.205-.258.345-.603.308-.955zm2.207.42v5.493h.852v-1.877h1.18c1.078 0 1.835-.739 1.835-1.812 0-1.07-.742-1.805-1.808-1.805zm.852.719h.982c.739 0 1.161.396 1.161 1.089 0 .692-.422 1.092-1.164 1.092h-.979zm-3.154.3c-.45.01-.83.28-1.05.28-.235 0-.593-.264-.981-.257a1.446 1.446 0 0 0-1.23.747c-.527.908-.139 2.255.374 2.995.249.366.549.769.944.754.373-.014.52-.242.973-.242.454 0 .586.242.98.235.41-.007.667-.366.915-.733.286-.417.403-.82.41-.841-.007-.008-.79-.308-.797-1.209-.008-.754.615-1.113.644-1.135-.352-.52-.9-.578-1.09-.593a1.123 1.123 0 0 0-.092-.002zm8.204.397c-.99 0-1.606.533-1.652 1.256h.777c.072-.358.369-.586.845-.586.502 0 .803.266.803.711v.309l-1.097.064c-.951.054-1.488.484-1.488 1.184 0 .72.548 1.207 1.332 1.207.526 0 1.032-.281 1.264-.727h.019v.659h.788v-2.76c0-.803-.62-1.317-1.591-1.317zm1.94.072l1.446 4.009c0 .003-.073.24-.073.247-.125.41-.33.571-.711.571-.069 0-.206 0-.267-.015v.666c.06.011.267.019.335.019.83 0 1.226-.312 1.568-1.283l1.5-4.214h-.868l-1.012 3.259h-.015l-1.013-3.26zm-1.167 2.189v.316c0 .521-.45.917-1.024.917-.442 0-.731-.228-.731-.579 0-.342.278-.56.769-.593z";
const KLARNA =
  "M4.592 2v20H0V2h4.592zm11.46 0c0 4.194-1.583 8.105-4.415 11.068l-.278.283L17.702 22h-5.668l-6.893-9.4 1.779-1.332c2.858-2.14 4.535-5.378 4.637-8.924L11.562 2h4.49zM21.5 17a2.5 2.5 0 110 5 2.5 2.5 0 010-5z";

type Mark = { name: string; bg: string; border?: string; body: ReactNode };

const marks: Mark[] = [
  {
    name: "Visa",
    bg: "#fff",
    body: (
      <svg x="6" y="6" width="26" height="12" viewBox="0 7.5 24 9" fill="#1434cb">
        <path d={VISA} />
      </svg>
    ),
  },
  {
    name: "Mastercard",
    bg: "#fff",
    body: (
      <>
        <circle cx="15" cy="12" r="7" fill="#eb001b" />
        <circle cx="23" cy="12" r="7" fill="#f79e1b" />
        <path d="M19 6.26a7 7 0 0 1 0 11.48 7 7 0 0 1 0-11.48z" fill="#ff5f00" />
      </>
    ),
  },
  {
    name: "PayPal",
    bg: "#fff",
    body: (
      <svg x="12" y="4" width="14" height="16" viewBox="0 0 24 24">
        <path d={PAYPAL_BACK} fill="#009cde" />
        <path d={PAYPAL} fill="#003087" />
      </svg>
    ),
  },
  {
    name: "Apple Pay",
    bg: "#fff",
    body: (
      <svg x="3" y="3" width="32" height="18" viewBox="3.5 7.6 17 9.2" fill="#000">
        <path d={APPLE_PAY} />
      </svg>
    ),
  },
  {
    name: "Shop Pay",
    bg: "#5a31f4",
    border: "#5a31f4",
    body: (
      <text
        x="19"
        y="15.6"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
        fontSize="10.5"
        fontWeight="700"
        fontStyle="italic"
        letterSpacing="-0.2"
      >
        shop
      </text>
    ),
  },
  {
    name: "Klarna",
    bg: "#ffb3c7",
    border: "#ffb3c7",
    body: (
      <svg x="12" y="5" width="14" height="14" viewBox="0 0 24 24" fill="#0b051d">
        <path d={KLARNA} />
      </svg>
    ),
  },
];

export const paymentNames = marks.map((m) => m.name);

/** A row of payment cards. Read out as one list, so screen readers hear the names once. */
export function PaymentMarks({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <ul aria-label="Ways to pay" className={`flex flex-wrap gap-1.5 ${className}`}>
      {marks.map((m) => (
        <li key={m.name} className="flex">
          <svg width={(size * 38) / 24} height={size} viewBox="0 0 38 24" role="img" aria-label={m.name}>
            <rect x="0.5" y="0.5" width="37" height="23" rx="3" fill={m.bg} stroke={m.border ?? "#d8d4cc"} />
            {m.body}
          </svg>
        </li>
      ))}
    </ul>
  );
}

function LockIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true" className="flex-none">
      <rect x="5" y="10.5" width="14" height="10" rx="1" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/** The reassurance under Add to bag: secure checkout and the ways to pay. */
export function SecureCheckout() {
  return (
    <div className="flex flex-col gap-2.5 border-t border-line-soft pt-4">
      <p className="flex items-center gap-2 text-[13px]">
        <LockIcon />
        <span>
          <span className="font-medium">Secure checkout.</span> <span className="text-ink-2">Pay by card, PayPal, Apple Pay, Shop Pay or Klarna.</span>
        </span>
      </p>
      <PaymentMarks />
    </div>
  );
}
