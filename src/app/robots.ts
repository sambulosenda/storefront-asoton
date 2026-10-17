import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Filtered and sorted pages are endless variations of the collections. Search pages
    // aren't blocked here: they carry a noindex tag, which crawlers only see if they may fetch them.
    rules: { userAgent: "*", allow: "/", disallow: ["/*?*filter=", "/*?*sort="] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
