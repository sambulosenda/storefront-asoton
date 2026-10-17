# Storefront

A Next.js (App Router, TypeScript, Tailwind) storefront powered by the Shopify Storefront API.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional: add your store's domain and Storefront token
npm run dev
```

Without any env vars the app reads from Shopify's public demo store, [mock.shop](https://mock.shop), so it works out of the box.

## Structure

- `src/lib/shopify` – Storefront API client and queries (cached with `"use cache"`)
- `src/app/page.tsx` – product grid
- `src/app/products/[handle]` – product detail page
