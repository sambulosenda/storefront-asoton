// Shopify Search & Discovery filters, as the collection page reads and writes them.
// Each selected filter is the JSON `input` string Shopify gives the filter value, kept
// in the URL as a repeated `filter` parameter.

import type { Filter, SortKey } from "@/lib/shopify/types";

export const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "best-selling", label: "Best selling" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
];

export function parseSort(value: string | string[] | undefined): SortKey {
  const v = Array.isArray(value) ? value[0] : value;
  return SORTS.some((s) => s.key === v) ? (v as SortKey) : "featured";
}

export function parseFilters(value: string | string[] | undefined): string[] {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.filter((v) => {
    try {
      return typeof JSON.parse(v) === "object";
    } catch {
      return false;
    }
  });
}

export type FilterKind = "colour" | "size" | "availability" | "price" | "list";

export function filterKind(filter: Filter): FilterKind {
  if (filter.type === "PRICE_RANGE") return "price";
  if (/availab/i.test(filter.label) || filter.id.endsWith(".availability")) return "availability";
  if (/colou?r/i.test(filter.label)) return "colour";
  if (/size/i.test(filter.label)) return "size";
  return "list";
}

export const isPriceInput = (input: string) => input.startsWith('{"price"');

export function priceInput(min: string, max: string) {
  const price: { min?: number; max?: number } = {};
  if (min !== "" && !Number.isNaN(Number(min))) price.min = Number(min);
  if (max !== "" && !Number.isNaN(Number(max))) price.max = Number(max);
  return price.min === undefined && price.max === undefined ? null : JSON.stringify({ price });
}

export function readPrice(selected: string[]) {
  const raw = selected.find(isPriceInput);
  if (!raw) return { min: "", max: "" };
  const { price } = JSON.parse(raw) as { price: { min?: number; max?: number } };
  return { min: price.min?.toString() ?? "", max: price.max?.toString() ?? "" };
}

/** A short label for a selected filter chip, e.g. "Kente", "UK 10" or "£50–£120". */
export function chipLabel(input: string, filters: Filter[]) {
  if (isPriceInput(input)) {
    const { min, max } = readPrice([input]);
    if (min && max) return `£${min}–£${max}`;
    return min ? `From £${min}` : `Up to £${max}`;
  }
  for (const filter of filters) {
    const value = filter.values.find((v) => v.input === input);
    if (value) {
      if (filterKind(filter) === "size" && /^\d+$/.test(value.label)) return `UK ${value.label}`;
      return value.label;
    }
  }
  return null;
}

/** Fallback swatch colours, for colour values that don't have one set in Shopify. */
const COLOURS: Record<string, string> = {
  indigo: "#1E2A55",
  black: "#141310",
  ecru: "#E6DCC6",
  white: "#F5F4F1",
  gold: "#B88A2E",
  terracotta: "#B2573A",
  umber: "#5B4433",
  forest: "#2F4A3A",
  green: "#2F4A3A",
  rust: "#9C4A2A",
  blue: "#2B4C7E",
  red: "#8C2F23",
  brown: "#5B4433",
  cream: "#EDE6D6",
  grey: "#8A857C",
  gray: "#8A857C",
};

export function swatchColour(name: string, swatch?: string | null) {
  if (swatch) return swatch;
  const key = Object.keys(COLOURS).find((k) => name.toLowerCase().includes(k));
  return key ? COLOURS[key] : "#D8D4CC";
}
