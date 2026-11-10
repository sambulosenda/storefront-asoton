"use client";

// Shopify's CDN resizes on its own (and serves WebP/AVIF by the browser's Accept header), so images go
// straight to it at the width Next asks for, rather than through Vercel's optimizer, which bills per image.
export default function shopifyImageLoader({ src, width }: { src: string; width: number }) {
  if (!src.startsWith("https://cdn.shopify.com/")) return src;
  const url = new URL(src);
  url.searchParams.set("width", String(width));
  return url.toString();
}
