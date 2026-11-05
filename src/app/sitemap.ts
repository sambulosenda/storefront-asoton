import type { MetadataRoute } from "next";
import { getSitemapEntries, policyHandles } from "@/lib/shopify";
import { siteUrl, unlistedCollections } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, collections } = await getSitemapEntries();
  const pages = ["", "/collections/all", "/story", "/lookbook", "/help", "/faqs"].map((path) => ({ url: `${siteUrl}${path}` }));
  return [
    ...pages,
    ...collections.filter((c) => !unlistedCollections.includes(c.handle)).map((c) => ({ url: `${siteUrl}/collections/${c.handle}`, lastModified: c.updatedAt })),
    ...products.map((p) => ({
      url: `${siteUrl}/products/${p.handle}`,
      lastModified: p.updatedAt,
      images: p.images.nodes.map((i) => i.url),
    })),
    ...policyHandles.map((h) => ({ url: `${siteUrl}/policies/${h}` })),
  ];
}
