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
- `src/app/page.tsx` – product grid
- `src/app/products/[handle]` – product detail page
