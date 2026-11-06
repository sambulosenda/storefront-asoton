import type { MetadataRoute } from "next";
import { getPolicy, getSitemapEntries, policyHandles } from "@/lib/shopify";
import { siteUrl, unlistedCollections } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ products, collections }, policies] = await Promise.all([
    getSitemapEntries(),
    // Only the policies filled in under Settings → Policies; the rest are 404s.
    Promise.all(policyHandles.map(async (h) => ((await getPolicy(h)) ? h : null))),
  ]);
  const pages = ["", "/collections/all", "/story", "/lookbook", "/help", "/faqs"].map((path) => ({ url: `${siteUrl}${path}` }));
  return [
    ...pages,
    ...collections.filter((c) => !unlistedCollections.includes(c.handle)).map((c) => ({ url: `${siteUrl}/collections/${c.handle}`, lastModified: c.updatedAt })),
    ...products.map((p) => ({
      url: `${siteUrl}/products/${p.handle}`,
      lastModified: p.updatedAt,
      images: p.images.nodes.map((i) => i.url),
    })),
    ...policies.filter(Boolean).map((h) => ({ url: `${siteUrl}/policies/${h}` })),
  ];
}
