# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Shoppers buying contemporary African clothing online, mainly in the UK, for themselves, their family (women, men, kids) or as gifts.

Open: the main buyer (diaspora shopping for weddings, events or church; new customers finding the prints; gift buyers; or a mix) and the main occasion are not confirmed yet.

## Product Purpose

The online shop of African Clothing Store, run by JT Aphrique Ltd. (Unit 41, The Mall, Luton LU1 2TD). This headless Shopify storefront replaces the shop's old Shopify theme at africanclothingstore.co.uk. It sells contemporary African clothing for women, men and kids, plus unisex pieces, accessories, gifts and fabric and lace. Success means shoppers find a piece, trust the delivery and fit, and check out.

## Positioning

Cloth knowledge: every piece says which cloth it is cut from (Ankara, kente, dashiki, embroidered cloth and others), how that cloth is made and where the technique comes from. The cuts are meant to be worn often, "for a wedding and for a Tuesday", not saved for one occasion a year.

Open: what else sets the shop apart from other UK African clothing shops and marketplace sellers (own designs, own workshop, made-to-measure, price, speed), and whether the shop makes or sources its pieces, is not confirmed.

## Operating Context

- Catalogue, collections, menus, metaobjects (campaign, look, cloth, occasion, delivery_rules) and metafields are managed in Shopify admin. The storefront reads them through the Storefront API and falls back gracefully when they are missing.
- Two kinds of pieces: ready to ship (dispatched in 2 to 4 working days) and made to order or custom made (made first, 14 days unless the product option says otherwise). Shoppers choose under "How would you like it?" with arrival dates shown.
- UK first: prices in GBP, UK delivery in 2 to 4 days after dispatch by priority courier, free UK delivery from £50. International delivery 5 to 8 days. Other markets and currencies appear only once Shopify has two or more.
- Returns within 30 days for ready-to-ship pieces only. Made-to-order pieces come back only when faulty. Refunds in 5 to 10 working days once a return passes its checks.
- Newsletter sign-ups become Shopify customers with email marketing on.

## Capabilities and Constraints

- Stack: Next.js 16 App Router, TypeScript, Tailwind, Shopify Storefront API. Shop-wide copy and settings live in `src/lib/site.ts`.
- Routes: home, collections, product, search, Our story, policies (shop group); lookbook, help, FAQs (studio group).
- Product pages show garment measurements in centimetres and inches, care, fit, model details and cloth.
- Shop by cloth lists only cloths the store has pieces in. Shop by occasion comes from `occasion` entries.
- Old theme URLs redirect to the new paths.

## Brand Commitments

- Brand: JT Aphrique leads (the logo's name). "African Clothing Store" is the shop's long-standing name and domain (africanclothingstore.co.uk), kept for search and continuity. Company: JT Aphrique Ltd.
- Contact: sales@africanclothingstore.co.uk, +44 1438 211744.
- Social: Instagram, Facebook, YouTube and X as @jtaphrique / JT APHRIQUE OFFICIAL.
- Copy is plain and specific: delivery, fit and returns stated as facts, with real numbers.

## Evidence on Hand

- Real product catalogue and photos in Shopify.
- Product reviews are wired (`reviews.rating`, `reviews.rating_count` metafields from a reviews app). Whether real ratings exist for most products is not confirmed.
- Not confirmed and must not be invented: testimonials, press, years trading, customer counts, "handmade" or "made in" claims.

## Product Principles

1. Name the cloth. Every piece carries its cloth, technique and origin; that knowledge is the shop's edge.
2. State delivery and fit as facts. Arrival dates, made-to-order time, measurements and returns are specific and match what checkout charges.
3. Clothes to wear often. Present pieces as everyday and occasion wear, not costume.
4. Degrade gracefully. Every page works and looks intended when Shopify content is missing.
