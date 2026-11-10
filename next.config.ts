import type { NextConfig } from "next";

const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN;

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }],
  },
  cacheComponents: true,
  // Lets a phone on the same Wi-Fi use `npm run dev` (e.g. http://192.168.0.68:3000). Without it Next blocks the
  // page's dev scripts from other addresses, so nothing on the page responds to taps. Dev only.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  // Crawlers on this list get the title, description and canonical in <head> before the page,
  // and a real 404 status for missing products. Next's default list (next/dist/shared/lib/router/utils/html-bots)
  // leaves out Googlebot itself, which then gets those tags late, in <body>, and a 200 with noindex.
  htmlLimitedBots:
    /Googlebot|[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight/i,
  partialPrefetching: true,
  // The shop's old Shopify theme kept its FAQs here. Send old links and search results to the new page.
  async redirects() {
    return [
      { source: "/pages/faqs", destination: "/faqs", permanent: true },
      { source: "/pages/african-clothing-faqs-support", destination: "/faqs", permanent: true },
      // The old theme's other pages, to the page that now says the same thing.
      { source: "/pages/african-fashion-about-us", destination: "/story", permanent: true },
      { source: "/pages/contact", destination: "/help#contact", permanent: true },
      { source: "/pages/african-clothing-contact-us", destination: "/help#contact", permanent: true },
      { source: "/pages/african-clothing-shipping-delivery", destination: "/help#delivery", permanent: true },
      { source: "/pages/african-clothing-track-order", destination: "/help#delivery", permanent: true },
      { source: "/pages/african-clothing-refund-policy", destination: "/help#returns", permanent: true },
      { source: "/pages/african-clothing-privacy-policy", destination: "/policies/privacy-policy", permanent: true },
      // Older addresses the Shopify site itself still redirected to the pages above.
      ...[
        ["/pages/avada-faqs", "/faqs"],
        ["/pages/about-us", "/story"],
        ["/pages/contact-us", "/help#contact"],
        ["/pages/shipping-delivery", "/help#delivery"],
        ["/pages/order-tracking", "/help#delivery"],
        ["/pages/refund-and-returns-policy", "/help#returns"],
        ["/pages/refund_returns", "/help#returns"],
        ["/pages/privacy-policy", "/policies/privacy-policy"],
        ["/pages/privacy-policy-2-2", "/policies/privacy-policy"],
        ["/pages/data-sharing-opt-out", "/policies/privacy-policy"],
        ["/pages/african-clothing-privacy-choices", "/policies/privacy-policy"],
        ["/pages/home", "/"],
        ["/pages/african-clothing-home-store", "/"],
        ["/pages/shop", "/collections/all"],
        ["/pages/shop-2", "/collections/all"],
        ["/pages/fashion-2", "/collections/all"],
        ["/pages/fashion-3", "/collections/all"],
        ["/pages/african-fashion-2-collection", "/collections/all"],
        ["/pages/african-fashion-3-collection", "/collections/all"],
        // From the shop's site before Shopify (WooCommerce), still linked from elsewhere.
        ["/product/chidike-patchwork-trousers", "/products/unisex-african-patchwork-cargo-trousers-boho-wide-leg-festival-pants"],
        ["/product/:slug", "/collections/all"],
        ["/product-category/:path*", "/collections/all"],
      ].map(([source, destination]) => ({ source, destination, permanent: true })),
      // Old product and collection handles that Shopify redirected are followed on those pages (src/lib/old-links.ts),
      // only once nothing lives at the old address, as Shopify did. The old blog's posts (theme filler, such as a
      // coffee table guide) aren't brought over, so their addresses are a plain 404.
      { source: "/collections/:collection/products/:product", destination: "/products/:product", permanent: true },
      { source: "/cart", destination: "/", permanent: false },
      // What only Shopify serves (accounts, orders, checkout, and old pages with no match
      // here, such as the terms) goes back to Shopify, which sends it on to the store's primary domain.
      ...(shopifyDomain
        ? ["/account/:path*", "/account", "/orders/:path*", "/checkouts/:path*", "/cart/c/:path*", "/apps/:path*", "/pages/:page"].map(
            (source) => ({ source, destination: `https://${shopifyDomain}${source}`, permanent: false }),
          )
        : []),
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
