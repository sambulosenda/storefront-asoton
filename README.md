# Storefront

A Next.js (App Router, TypeScript, Tailwind) storefront powered by the Shopify Storefront API.

## Getting started

```bash
npm install
cp .env.example .env.local   # then add the Storefront access token
npm run dev
```

The store is **My Store 2** (`iwsv0v-te.myshopify.com`). With no env vars at all, the app reads from Shopify's public demo store, [mock.shop](https://mock.shop), instead.

### Getting a Storefront access token

1. In Shopify admin, go to **Sales channels**, add the **Headless** channel from the Shopify App Store, and open it.
2. Click **Create storefront**.
3. Under **Storefront API**, copy the **public access token** into `SHOPIFY_STOREFRONT_ACCESS_TOKEN` in `.env.local` (and in your hosting provider's env vars when you deploy).
4. In **Storefront API permissions**, make sure product and collection read access is enabled.

`.env.local` is gitignored; never commit the token.

## Structure

- `src/lib/shopify` – Storefront API client and queries (cached with `"use cache"`)
- `src/lib` – cart and form server actions, filter/sort parsing, cloth data, site copy (`site.ts` holds the placeholder text to replace)
- `src/app/(shop)` – home, collections, search, product, story and policy pages with the full header and footer
- `src/app/(studio)` – lookbook and help, with the compact footer
- `src/components` – header, footer, bag drawer, search, menu, size guide, filters, cookie consent and the rest of the UI

## What the design expects in Shopify

The pages fall back gracefully when these are missing, but they look like the design only once they exist:

- **Collections** with the handles `new-in`, `women`, `men` and `accessories`.
- **Menus** with the handles `women` and `men` (the category tabs and the mobile menu).
- **Metaobjects**: `campaign` (the home hero) and `cloth` (name, technique, origin, caption, collection) entries.
- **Product metafields**: `custom.care`, `custom.fit`, `custom.model`, `custom.cloth`, plus `reviews.rating` and `reviews.rating_count` from a reviews app.
- **Shop metafield** `custom.free_delivery_threshold` (the free delivery amount in the announcement bar).
- **Search & Discovery** filters for cloth, colour, size, price and availability.
- Storefront API permissions for products, collections, metaobjects, navigation menus, policies and checkouts (cart).

The newsletter, back-in-stock and contact forms validate input but don't send anything yet; they need a backend (for example a Shopify Flow or email provider).
