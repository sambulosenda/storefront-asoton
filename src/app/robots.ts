import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Search results and filtered pages are endless variations of the collections.
    rules: { userAgent: "*", allow: "/", disallow: ["/search", "/*?*filter=", "/*?*sort="] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
