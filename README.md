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

- **Collections** with the handles `new-in`, `women`, `men` and `accessories`. Until `women` and `men` exist, those pages list every product.
  - The Women and Men tiles on the home page show the collection's image (set it under **Collection image** in the admin). Without one, they show the collection's first product photo, and until the collection exists, the first photo a search for the word in `departments` in `src/lib/site.ts` finds (`dress` and `kaftan`).
- **Menus** with the handles `women` and `men` (the category tabs and the mobile menu).
- **Metaobjects**:
  - `campaign`, with fields `label` (single line text, the small line above the headline), `headline` (single line text), `body` (multi-line text), `image` (file), and optionally `cta` (button text) and `link` (where the button goes, such as `/collections/women`). Its entries, by handle:
    - `home`: the home hero and the phone menu's promo tile. Without it, the hero leads with the first product in the `new-in` collection (or the newest product, if that collection doesn't exist): its photo, its name and a link to it.
    - `women`, `men` (any collection handle): the editorial block between the product grids on that collection page. Its photo is the entry's image, else the collection's image. Without an entry, the block isn't shown.
    - `story`: the portrait on the Our story page. Without it, the portrait is the newest product's photo.
    - `workshop`: the wide photo on the Our story page. Without it, that photo isn't shown.
    - `lookbook`: the lookbook's opening photo, title and intro. Without it, the page is titled Lookbook and uses the first look's photo.
  - `look`, with fields `title` (single line text), `body` (multi-line text, optional), `image` (file) and `products` (list of products). Each entry is a look on the lookbook page, with the pieces listed under it. Until there are looks, the page shows the newest products one at a time.
  - `cloth` (name, technique, origin, caption, collection) entries. They change a cloth's words and point it at a collection.
- **Shop by cloth** (home page, menu and Our story page) lists only the cloths the store has pieces in, and previews each with one of those pieces. A cloth's pieces are its `cloth` entry's collection, or else the products a search for its name finds (`ankara` for wax print) whose title, type or tags name the cloth. The section is hidden if no cloth has any.
- **Product metafields**: `custom.care`, `custom.fit`, `custom.model`, `custom.cloth`, plus `reviews.rating` and `reviews.rating_count` from a reviews app.
- **Shop metafield** `custom.free_delivery_threshold` (the free delivery amount in the announcement bar).
- **Search & Discovery** filters for cloth, colour, size, price and availability.
- **Markets** for each country you sell to. The country and currency selector in the header and footer lists them and only appears once there are two or more; prices, the bag and checkout then follow the shopper's choice. The free delivery amount and delivery copy stay in pounds.
- Storefront API permissions for products, collections, metaobjects, navigation menus, policies and checkouts (cart).

The newsletter, back-in-stock and contact forms validate input but don't send anything yet; they need a backend (for example a Shopify Flow or email provider).

## Search engines and sharing

`/sitemap.xml` lists every product (with its photos), collection and policy, and `/robots.txt` keeps filtered and sorted listings out of the index. Search results and collections that don't exist in Shopify yet carry a noindex tag. Product pages carry Google product and breadcrumb data, collections carry breadcrumb data, and the home page names the shop for Google's brand panel. Set `SITE_URL` (for example `https://asotone.com`) before building, since the sitemap and robots file are built once and use it for every link. Shopify fields that feed search results: each product's SEO title and description (else the first 160 characters of its description), image alt text, SKU and barcode (sent as the GTIN).

## Tests

```bash
npx playwright install chromium   # once
npm run test:e2e
```

The browser tests build the site and run it against a small fake store in `e2e/fixtures/storefront.cjs`, so they never touch the real Shopify store. They cover the bag, filters, search, the country selector and sold-out sizes on a desktop and a phone screen, and check every page with axe for WCAG 2.1 AA problems. The same checks, plus lint and type checks, run on every pull request.
