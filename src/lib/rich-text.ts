/**
 * Product descriptions arrive from Shopify as HTML pasted from many places over the years: the old
 * theme's coloured links and rules, and in places whole chat transcripts with their own class names,
 * which this site's styles then act on (one wraps the text in a 24px round clipping box). This keeps
 * the words and the plain structure (paragraphs, lists, bold, italic, links, line breaks) and drops
 * everything else: classes, inline styles, data attributes, images, icons and buttons.
 */

// Removed along with everything inside them.
const DROP_WITH_CONTENT = ["script", "style", "svg", "button", "iframe", "noscript", "template", "form", "video", "audio", "object"];
// Kept as they are, without attributes (links keep a safe href).
const KEEP = new Set(["p", "br", "ul", "ol", "li", "strong", "em", "a"]);
const RENAME: Record<string, string> = { b: "strong", i: "em" };
// Headings inside a description are section labels ("Features:"), set as a bold paragraph.
const HEADING = /^h[1-6]$/;

const safeHref = (attrs: string) => {
  const href = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrs);
  const url = (href?.[1] ?? href?.[2] ?? "").trim();
  return /^(https?:|mailto:|tel:|\/|#)/i.test(url) ? url.replace(/"/g, "&quot;") : null;
};

export function cleanDescription(html: string): string {
  let out = html.replace(/<!--[\s\S]*?-->/g, "");
  for (const tag of DROP_WITH_CONTENT) out = out.replace(new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`, "gi"), "");
  // Text only screen readers saw on the page it was copied from ("ChatGPT said:").
  out = out.replace(/<(\w+)\b[^>]*\bclass\s*=\s*"[^"]*\bsr-only\b[^"]*"[^>]*>[\s\S]*?<\/\1>/gi, "");
  out = out.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (_, close: string, raw: string, attrs: string) => {
    const name = RENAME[raw.toLowerCase()] ?? raw.toLowerCase();
    if (HEADING.test(name)) return close ? "</strong></p>" : "<p><strong>";
    if (!KEEP.has(name)) return " ";
    if (name === "br") return close ? "" : "<br>";
    if (name === "a" && !close) {
      const href = safeHref(attrs);
      return href ? `<a href="${href}">` : "<a>";
    }
    return `<${close}${name}>`;
  });
  return out
    .replace(/<p>(?:\s|&nbsp;|<br>)*<\/p>/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
