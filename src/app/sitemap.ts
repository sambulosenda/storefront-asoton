import type { MetadataRoute } from "next";
import { getSitemapEntries, policyHandles } from "@/lib/shopify";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, collections } = await getSitemapEntries();
  const pages = ["", "/story", "/lookbook", "/help"].map((path) => ({ url: `${siteUrl}${path}` }));
  return [
    ...pages,
    ...collections.map((c) => ({ url: `${siteUrl}/collections/${c.handle}`, lastModified: c.updatedAt })),
    ...products.map((p) => ({ url: `${siteUrl}/products/${p.handle}`, lastModified: p.updatedAt })),
    ...policyHandles.map((h) => ({ url: `${siteUrl}/policies/${h}` })),
  ];
}
