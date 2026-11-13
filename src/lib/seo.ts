// Tidies the search titles and descriptions that came over from the shop's old Shopify theme.

// A tag, to its real end: a ">" inside a quoted attribute (class="[&>*]:…", as pasted from a chat
// app) is not the end of it. Read as one, the rest of the tag was left in the text as words.
const TAG = /<\/?[a-z!][^>"']*(?:(?:"[^"]*"|'[^']*')[^>"']*)*>/gi;

/** Text with its HTML tags and the common entities taken out, and its spaces closed up. */
export function plainText(html: string) {
  return html
    .replace(TAG, (tag) => (/^<(br|\/p|\/div|\/li)\b/i.test(tag) ? " " : ""))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&rsquo;|&lsquo;/g, "’")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** A description shortened to fit a search result snippet, cut at a word. */
export function snippet(text: string, max = 160) {
  const clean = plainText(text);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}

// The old theme ended most titles with the shop's address or name. The site adds its name itself.
const BRAND_SUFFIX = /\s*[-–|·]\s*(africanclothingstore\.co\.uk|african clothing store)\s*$/i;

/** A search title set in Shopify, without the shop's name or address on the end. Null when there is none. */
export function searchTitle(title: string | null | undefined) {
  const clean = title?.replace(BRAND_SUFFIX, "").trim();
  return clean || null;
}

/**
 * A search description set in Shopify, as plain text that fits a result. Null when there is none,
 * or when it is one of the theme's unfilled placeholders such as "#taxonomy_description".
 */
export function searchDescription(description: string | null | undefined) {
  if (!description || /^#\w+$/.test(description.trim())) return null;
  return snippet(description) || null;
}
