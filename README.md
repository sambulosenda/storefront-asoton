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
4. In **Storefront API permissions**, make sure product and collection read access is enabled, and turn on **customers write** (`unauthenticated_write_customers`) so newsletter sign-ups can be added as customers.

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
  - `campaign`, with fields `label` (single line text, the small line above the headline), `headline` (single line text), `italic_word` (the part of the headline set in italic), `body` (multi-line text), `desktop_image` and `mobile_image` (files: the wide photo and the phone crop; older entries can use `image`), `subject_position` (Left, Centre or Right: where the people are in the photo), `women_link` and `men_link` (collections for the two buttons) and `in_the_picture` (list of products). Its entries, by handle:
    - `home`, or else the first entry not named below: the home hero and the phone menu's promo tile. The photo fills the hero with the copy over it and the pieces listed under "In the picture". Until the entry has a photo, the pieces show side by side next to the copy. Without any entry, the hero leads with the newest product.
    - `women`, `men` (any collection handle): the editorial block between the product grids on that collection page. Its photo is the entry's image, else the collection's image. Without an entry, the block isn't shown.
    - `story`: the portrait on the Our story page. Without it, the portrait is the newest product's photo.
    - `workshop`: the wide photo on the Our story page. Without it, that photo isn't shown.
    - `lookbook`: the lookbook's opening photo, title and intro. Without it, the page is titled Lookbook and uses the first look's photo.
  - `look`, with fields `title` (single line text), `body` (multi-line text, optional), `image` (file) and `products` (list of products). Each entry is a look on the lookbook page, with the pieces listed under it. Until there are looks, the page shows the newest products one at a time.
  - `cloth` (name, technique, origin, caption, collection) entries. They change a cloth's words and point it at a collection The cloth's `short_description` works as its caption.
  - `occasion` (name, intro, photo, collection): the home page's Shop by occasion list.
  - `delivery_rules` (one entry): order cutoff, dispatch days, UK standard, express and international delivery days, the free UK delivery amount and bank holidays. These fill in the delivery copy and the arrival dates on product pages.
- **Shop by cloth** (home page, menu and Our story page) lists only the cloths the store has pieces in, and previews each with one of those pieces. A cloth's pieces are its `cloth` entry's collection, or else the products a search for its name finds (`ankara` for wax print) whose title, type or tags name the cloth. The section is hidden if no cloth has any.
- **Product metafields**: `custom.care`, `custom.fit`, `custom.model`, `custom.cloth`, plus `reviews.rating` and `reviews.rating_count` from a reviews app.
- **Shop metafield** `custom.free_delivery_threshold` (the free delivery amount in the announcement bar). Without it, the `delivery_rules` amount is used.
- **Purchase type** product option (values like "Ready to ship" and "Made to order" or "Custom made in 14 days"): shown as the "How would you like it?" choice with arrival dates.
- **Search & Discovery** filters for cloth, colour, size, price and availability.
- **Markets** for each country you sell to. The country and currency selector in the header and footer lists them and only appears once there are two or more; prices, the bag and checkout then follow the shopper's choice. The free delivery amount and delivery copy stay in pounds.
- Storefront API permissions for products, collections, metaobjects, navigation menus, policies and checkouts (cart).

## Forms

- **Newsletter**: adds the email to Shopify **Customers** with email marketing on, through the Storefront API, so Shopify Email campaigns reach them. People who are already customers can't be opted in from the site, so the shop gets an email asking to tick it for them.
- **Back in stock** and **contact**: emailed to the shop through [Resend](https://resend.com), with Reply-To set to the customer, so answering is just replying.

To switch on the emails, make a free Resend account with the shop's inbox, create an API key, and set `RESEND_API_KEY` and `SHOP_EMAIL` (that same inbox). Until a domain is verified in Resend, mail comes from `onboarding@resend.dev` and can only go to that inbox, which is all these forms need. Without these, the forms say plainly that they aren't connected, and nothing pretends to send. A hidden field drops form spam from bots.

## Deploying to Vercel

1. Sign in at [vercel.com](https://vercel.com) with GitHub and **Add New > Project**, then import `storefront-asoton`. Vercel finds Next.js on its own; keep the default build settings.
2. Under **Environment Variables**, add `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `SHOPIFY_STOREFRONT_API_VERSION`, `SITE_URL` (the address the site will live at, such as `https://asotone.com`), and `RESEND_API_KEY` and `SHOP_EMAIL` if the forms should send.
3. Click **Deploy**. Every push to `main` deploys again, and every pull request gets its own preview link.
4. To use your own domain, add it under **Settings > Domains** and follow the DNS steps there, then change `SITE_URL` to it and redeploy (the sitemap and robots file are built with it).

## Search engines and sharing

`/sitemap.xml` lists every product (with its photos), collection and policy, and `/robots.txt` keeps filtered and sorted listings out of the index. Search results and collections that don't exist in Shopify yet carry a noindex tag. Product pages carry Google product and breadcrumb data, collections carry breadcrumb data, and the home page names the shop for Google's brand panel. Set `SITE_URL` (for example `https://asotone.com`) before building, since the sitemap and robots file are built once and use it for every link. Shopify fields that feed search results: each product's SEO title and description (else the first 160 characters of its description), image alt text, SKU and barcode (sent as the GTIN).

## Tests

```bash
npx playwright install chromium   # once
npm run test:e2e
```

The browser tests build the site and run it against a small fake store in `e2e/fixtures/storefront.cjs`, so they never touch the real Shopify store. They cover the bag, filters, search, the country selector and sold-out sizes on a desktop and a phone screen, and check every page with axe for WCAG 2.1 AA problems. The same checks, plus lint and type checks, run on every pull request.
