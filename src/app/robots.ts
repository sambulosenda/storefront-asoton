import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Filtered and sorted collections are endless variations of the plain ones. Search pages
    // aren't blocked here: they carry a noindex tag, which crawlers only see if they may fetch them.
    rules: { userAgent: "*", allow: "/", disallow: ["/collections/*?*filter=", "/collections/*?*sort="] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
