import type { Money } from "@/lib/shopify/types";

/** Prices as £85, or £85.50 when there are pence (house style). */
export function formatMoney({ amount, currencyCode }: Money) {
  const value = Number(amount);
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
    // "$240" rather than en-GB's "US$240" for shoppers who switched country.
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

const COLOUR_OPTION = /^colou?r$/i;
// Stores name it "Size", "SIZE", "Choose size" and so on.
const SIZE_OPTION = /\bsize\b/i;

export const isColourOption = (name: string) => COLOUR_OPTION.test(name);
export const isSizeOption = (name: string) => SIZE_OPTION.test(name);

/** The line under a product name on a card: its colour, or how many colours it comes in. */
export function colourLine(options: { name: string; optionValues: { name: string }[] }[]) {
  const colour = options.find((o) => isColourOption(o.name));
  if (!colour) return null;
  const n = colour.optionValues.length;
  return n === 1 ? colour.optionValues[0].name : `${n} colours`;
}
