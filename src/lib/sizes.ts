/** A size as a shopper reads it: the short label on its button, its full name, and its US and EU sizes. */
export type Size = { value: string; short: string; full: string; extra: string | null };

const REGIONS: Record<string, string> = { UK: "UK", USA: "US", US: "US", EUR: "EU", EU: "EU" };
const REGION = /^(UK|USA|US|EUR|EU)\b\s*(.*)$/i;
const LETTER = /^(\d?X*[SML]|\d?XS)$/;
const WORDS: Record<string, string> = { SMALL: "S", MEDIUM: "M", LARGE: "L" };

/** "s" becomes "S" and "2xl" "2XL"; anything that isn't a lettered size is left as it is. */
function tidy(text: string) {
  const t = text.trim().replace(/^size\s+/i, "");
  return t.split("/").every((part) => LETTER.test(part.trim().toUpperCase())) ? t.toUpperCase().replace(/\s+/g, "") : t;
}

/**
 * Shopify size values come in many shapes: "10", "M", "UK 10, USA 6, EUR 38", "UK USA EUR M", "Size 14".
 * The button shows the UK size; the US and EU sizes, when the value has them, go in `extra`.
 */
export function parseSize(value: string): Size {
  const text = value.trim().replace(/\s+/g, " ");
  // "UK USA EUR M": one size, the same name everywhere.
  const shared = text.match(/^((UK|USA|US|EUR|EU)\s+){2,}(.+)$/i);
  if (shared) {
    const short = tidy(shared[3]);
    return { value, short, full: short, extra: null };
  }
  const parts = text.split(",").map((p) => p.trim()).filter(Boolean);
  const regions = parts.map((p) => p.match(REGION));
  if (regions.length && regions.every(Boolean)) {
    const sizes = regions
      .map((m) => ({ region: REGIONS[m![1].toUpperCase()], size: tidy(m![2]) }))
      .filter((s) => s.size);
    const uk = sizes.find((s) => s.region === "UK");
    const main = uk ?? sizes[0];
    if (main) {
      const others = sizes.filter((s) => s !== main).map((s) => `${s.region} ${s.size}`);
      return {
        value,
        short: uk ? main.size : `${main.region} ${main.size}`,
        full: `${main.region} ${main.size}`,
        extra: others.length ? others.join(" · ") : null,
      };
    }
  }
  const short = tidy(text);
  return { value, short, full: /^\d+$/.test(short) ? `UK ${short}` : short, extra: null };
}

/** Where a size sits: lettered sizes smallest first, then numbers and age ranges by their first number. */
function rank(short: string): [number, number] | null {
  const first = short.replace(/^(UK|US|EU) /, "").split("/")[0].trim().toUpperCase();
  const word = WORDS[first.split(" ")[0]];
  const letter = word ?? first.replace(/\s+/g, "");
  const m = letter.match(/^(\d)?(X*)([SML])$/);
  if (m) {
    const xs = m[1] ? Number(m[1]) : m[2].length;
    const base = { S: 2, M: 3, L: 4 }[m[3] as "S" | "M" | "L"];
    return [0, m[3] === "S" ? base - xs : m[3] === "L" ? base + xs : base];
  }
  const n = first.match(/^\d+(\.\d+)?/);
  return n ? [1, Number(n[0])] : null;
}

/** The option's values as sizes, in size order. Values that aren't sizes keep the store's order, after the rest. */
export function sortedSizes(values: string[]): Size[] {
  return values
    .map((v, i) => ({ size: parseSize(v), at: rank(parseSize(v).short) ?? [2, i] }))
    .sort((a, b) => a.at[0] - b.at[0] || a.at[1] - b.at[1])
    .map((s) => s.size);
}

/** A size's name in a sentence or the bag: "UK 10", "M", "UK 4XL". */
export const sizeName = (value: string) => parseSize(value).full;
