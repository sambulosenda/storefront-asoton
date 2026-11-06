---
name: African Clothing Store
description: Contemporary African clothing, presented so the cloth carries the colour.
colors:
  raw-cotton: "#f5f4f1"
  sand-stone: "#e8e5df"
  sand-stone-deep: "#dcd8d0"
  seam-line: "#d8d4cc"
  seam-line-soft: "#e2dfd8"
  seam-line-cloth: "#cfcac1"
  skeleton: "#e1ddd6"
  charcoal-ink: "#141310"
  charcoal-ink-soft: "#57534c"
  muted: "#736e66"
  adire-indigo: "#1e2a55"
  indigo-soft: "#c5c9d8"
  laterite-clay: "#6e4430"
  error-red: "#8c2f23"
  night-text: "#b5b0a6"
  night-line: "#3a3732"
  night-soft: "#d2cdc4"
  garment-base: "#cfc8bd"
typography:
  display:
    fontFamily: "Bodoni Moda, Bodoni 72, Didot, Georgia, serif"
    fontSize: "clamp(56px, 9vw, 136px)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Bodoni Moda, Bodoni 72, Didot, Georgia, serif"
    fontSize: "clamp(36px, 3.4vw, 48px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Bodoni Moda, Bodoni 72, Didot, Georgia, serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.1
  body:
    fontFamily: "Hanken Grotesk, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "Hanken Grotesk, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.35
  label:
    fontFamily: "Hanken Grotesk, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.14em"
rounded:
  none: "0px"
  full: "9999px"
spacing:
  gutter: "clamp(16px, 4vw, 48px)"
  grid-x-sm: "12px"
  grid-x-md: "24px"
  grid-y-sm: "32px"
  grid-y-md: "48px"
components:
  button-ink:
    backgroundColor: "{colors.charcoal-ink}"
    textColor: "{colors.raw-cotton}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 32px"
    height: "52px"
  button-ink-hover:
    backgroundColor: "{colors.adire-indigo}"
    textColor: "{colors.raw-cotton}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 32px"
    height: "52px"
  button-outline-hover:
    backgroundColor: "{colors.charcoal-ink}"
    textColor: "{colors.raw-cotton}"
  input-underline:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    height: "52px"
  chip-size:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal-ink}"
    typography: "{typography.body-small}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "48px"
  chip-size-selected:
    backgroundColor: "{colors.charcoal-ink}"
    textColor: "{colors.raw-cotton}"
  swatch-colour:
    rounded: "{rounded.full}"
    size: "10px"
  product-card-image:
    backgroundColor: "{colors.sand-stone}"
    rounded: "{rounded.none}"
---

# Design System: African Clothing Store

## Overview

**Creative North Star: "The Cloth Speaks"**

The cloth is the loudest thing on every page. Ankara, kente, adire and embroidered cloth bring the pattern and the saturated colour; the interface around them is raw cotton, sand and charcoal ink, and stays out of the way. The look is a high-end tailor's shop: a quiet room, good light, the garments hung where you can see them.

The type holds that balance. Bodoni Moda, a high-contrast serif with a true italic, sets headlines with editorial confidence. Hanken Grotesk does the work: names, prices, delivery facts, labels. Corners are square, surfaces are flat, and lines are hairline seams. A single cool accent, Adire Indigo, named after the Yoruba indigo-dyed cloth, marks interaction and, at most, one ground per page. Motion is slow and soft, like cloth settling, and switches off for anyone who asks for less motion.

The density is generous on editorial surfaces (hero, story, lookbook) and tight and orderly where people shop (grids, filters, product form).

**Key Characteristics:**
- Neutral, warm ground; photography and cloth supply all pattern and strong colour.
- Bodoni Moda display over Hanken Grotesk working text.
- Square corners, hairline borders, flat surfaces.
- One accent, Adire Indigo, used sparingly.
- Uppercase, wide-tracked labels and buttons.
- One easing, three speeds; all motion off under reduced motion.

## Colors

A warm, undyed-cotton neutral palette with one indigo accent and one earth tone, so the clothing is never out-shouted.

### Primary
- **Adire Indigo** (`adire-indigo`): the only interactive accent. Link hover, the focus ring, the hover state of the hero's filled button, and the ground behind a product page's cloth story.

- **Indigo Soft** (`indigo-soft`): secondary text on an indigo ground, tinted from the indigo rather than grey.

### Secondary
- **Laterite Clay** (`laterite-clay`): the home hero's ground, seen behind and around the campaign photo before it loads and at its edges. Used nowhere else.

### Neutral
- **Raw Cotton** (`raw-cotton`): the page background, drawer and dialog background, and the text colour on ink, indigo and clay grounds.
- **Sand Stone** (`sand-stone`) and **Sand Stone Deep** (`sand-stone-deep`): the ground behind product photos and quiet panels.
- **Seam Line** (`seam-line`), **Seam Line Soft** (`seam-line-soft`), **Seam Line Cloth** (`seam-line-cloth`): hairline borders, dividers, unselected chips, sold-out chips.
- **Skeleton** (`skeleton`): loading placeholders.
- **Charcoal Ink** (`charcoal-ink`): primary text, filled buttons, the announcement bar and the footer ground.
- **Charcoal Ink Soft** (`charcoal-ink-soft`): secondary text, colour names, prices on phones, eyebrows. The most used text colour after ink.
- **Muted** (`muted`): placeholders and struck-through unavailable options. Kept at 4.6:1 on Raw Cotton so placeholders stay readable.
- **Night Text / Night Line / Night Soft**: text, dividers and emphasis on the dark footer.
- **Garment Base** (`garment-base`): the tint behind the drawn garment placeholder.
- **Error Red** (`error-red`): form errors only.

### Named Rules
**The Cloth Carries Colour Rule.** Saturated colour and pattern come from the photographs and the cloth. Interface chrome (buttons, panels, badges, borders) stays in the cotton, sand and ink neutrals. Never print a pattern or a bright fill into the UI itself.

**The One Indigo Rule.** Adire Indigo is the only accent. It marks interaction (hover, focus) and appears as a ground once per page at most. Don't add a second accent hue.

## Typography

**Display Font:** Bodoni Moda (with Bodoni 72, Didot, Georgia), optical size axis, roman and italic
**Body Font:** Hanken Grotesk (with Helvetica Neue, Helvetica, Arial), weights 400, 500, 600

**Character:** A fashion-house Didone against a clean, slightly warm grotesque. The serif is the editorial voice; the grotesque speaks plainly about price, size and delivery.

### Hierarchy
- **Display** (400, `clamp(56px, 9vw, 136px)`, 0.9, −0.02em): the largest opener. The home hero sets its headline at 52px on phones and `clamp(56px, 6vw, 96px)` beside its photos (`clamp(52px, 7.2vw, 104px)` over a campaign photo), so a two-clause line holds to three lines. Lookbook and story openers use the same treatment at `clamp(52px, 7vw, 112px)` and `clamp(44px, 5vw, 72px)`; collection heroes at `clamp(48px, 6vw, 88px)`.
- **Headline** (400, 32px on phones, `clamp(36px, 3.4vw, 48px)` from md, 1.0): section headings such as product grids and shop-by lists.
- **Title** (400, 26 to 30px rising to 28 to 36px at md, 1.1 to 1.2): editorial block headings, prose `h2` (28px), the search field (22px, 32px at md).
- **Body** (400, 16px, 1.5; prose at 1.7 and max 720px): running text, policies, story.
- **Body small** (400 to 500, 13 to 15px): product names (14px, 15px at md, weight 500), prices, colour names, form help. 13px is the most-used size in the shop.
- **Label** (600, 12px, 0.14em, uppercase): section labels, table heads, buttons (13px). Eyebrows use 12px at 0.16em in Charcoal Ink Soft; field labels 11px, 12px at md.

### Named Rules
**The Italic Word Rule.** A campaign headline may set one word or phrase in Bodoni italic (the campaign's `italic_word`). One per headline, never a whole line.

**The Serif Speaks, Sans Works Rule.** Bodoni Moda is for headings and the search field only. Prices, sizes, delivery dates, buttons and labels are always Hanken Grotesk.

## Layout

A centred page container (max 1440px) with a fluid side gutter of `clamp(16px, 4vw, 48px)`. Editorial bands (a campaign hero, the footer) run full-bleed; their content sits back inside the container.

Product grids are two columns on phones (12px column gap, 32px row gap) and widen to more columns from md (24px column gap, 40 to 48px row gap). On phones, rails of 240px cards scroll sideways with snap points instead of wrapping.

The desktop header shows the full menu only from 80rem (the `nav` breakpoint), where it fits beside the centred logo; below that a menu button opens the phone menu. The phone header is 61px tall with 44px tap targets. A thin ink announcement bar sits above the header (36px phone, 40px desktop).

The home hero fills the first screen: `min(808px, 100svh − 97px)` on phones, `clamp(600px, 56vw, 860px)` on desktop, minimum 600px.

## Elevation & Depth

Flat by default. Depth comes from tonal grounds (cotton, sand, ink, indigo, clay) and hairline seams, not shadows. Shadows exist only where something floats over the page.

### Shadow Vocabulary
- **Menu lift** (`box-shadow: 0 12px 32px -16px rgba(20,19,16,0.35)`): the sort dropdown.
- **Drawer edge** (`box-shadow: -24px 0 48px -24px rgba(20,19,16,0.35)`): the right-side drawer (bag, filters) from md.
- **Swatch ring** (`box-shadow: inset 0 0 0 1px rgba(20,19,16,0.12)`): colour swatches in filters, so pale colours keep an edge.
- **Dialog backdrop** (`rgb(20 19 16 / 0.5)`): behind every modal and drawer.

### Named Rules
**The Flat Floor Rule.** Cards, panels and buttons have no shadow at rest or on hover. A shadow means "this floats above the page" and nothing else.

## Shapes

Square. Buttons, inputs, chips, cards, photos, drawers and dialogs all have 0 radius. The only round shapes are colour swatches and the colour-option buttons on the product page (full radius). Borders are 1px hairlines in Seam Line, darkening to Charcoal Ink on hover or selection. Product photos are cropped 3:4 and clipped, so a slow zoom on hover stays inside its frame.

## Components

### Buttons
Tailored and confident: tall, square, uppercase.
- **Shape:** square corners (0), 52px tall, 32px side padding.
- **Ink (primary):** Charcoal Ink fill, Raw Cotton text, 13px Hanken Grotesk 600 at 0.14em, uppercase. On the hero, hover turns the fill Adire Indigo.
- **Outline:** transparent, 1px Charcoal Ink border, ink text; hover fills with ink and turns the text Raw Cotton.
- **Arrow link:** 13px uppercase at 0.12em with a trailing arrow, 10px gap; the editorial "shop the edit" link.
- **Focus:** 2px Adire Indigo outline offset 3px; Raw Cotton over photos and dark grounds.

### Chips (size options)
- **Style:** square, 48px tall, 1px Seam Line border, 14px text.
- **State:** hover darkens the border to ink; selected is filled Charcoal Ink with Raw Cotton text; sold out keeps a soft border and strikes the text through; selected-and-sold-out keeps the ink border with muted struck-through text.

### Cards / Containers (product card)
- **Corner Style:** square.
- **Background:** Sand Stone behind a 3:4 photo.
- **Shadow Strategy:** none (Flat Floor Rule).
- **Behaviour:** the second photo fades in on hover (420ms); the photo zooms to 1.03 over 900ms. A small badge sits on a 90% Raw Cotton panel in uppercase 600. Below: name (14/15px, 500), colour (13px, soft ink) and price, with up to a row of 10px round colour swatches.
- **Internal spacing:** 10 to 14px between photo and text.

### Inputs / Fields
- **Style:** underline only. Transparent ground, a 1px Charcoal Ink bottom border, 52px tall, muted placeholder. Labels sit above in 11 to 12px uppercase at 0.14em.
- **Focus:** the global indigo focus ring; the field itself draws no outline.
- **Error:** message in Error Red below the field.

### Navigation
- **Announcement bar:** ink ground, Raw Cotton text, 11 to 12px at 0.06em; carries the free UK delivery threshold and the market selector.
- **Header:** Raw Cotton ground with a Seam Line bottom border, centred logo, text links on desktop from 80rem; 44px icon buttons (menu, search, bag) on phones.
- **Links:** underlined by default; hover turns Adire Indigo. Components that shouldn't look like links say so.
- **Footer:** Charcoal Ink ground, Night Text links, Night Line dividers.

### Hero cloth swatch (signature)
Until a campaign photo leads the home page, the hero shows one piece large on Sand Stone (a photo shot on white is multiplied into the sand) with a swatch of its cloth pinned to the photo's corner: a Raw Cotton frame around a tight crop of a Fabric & lace photo of that cloth, the cloth's name in Bodoni beneath and its origin in small sans. It overlaps the photo's left edge on desktop and sits inside the corner on phones. A piece printed in a cloth's pattern gets no swatch.

### Drawers and dialogs
Raw Cotton surfaces with no radius. Right-side drawers are full width on phones and 480px from md, sliding in over 420ms; top sheets slide down; centred dialogs settle in. The backdrop fades in.

### Motion
One easing (`cubic-bezier(0.22, 1, 0.36, 1)`) and three speeds: quick 180ms for taps, medium 420ms for drawers and hovers, slow 900ms for photos arriving. Hero lines rise 18px one after another (90ms apart). Photos settle in as they scroll into view; text never animates on scroll. A product photo morphs from its card into the product page with a brief blur. Under reduced motion every animation and transition is effectively off.

## Do's and Don'ts

### Do:
- **Do** let photography and cloth bring the colour; keep chrome in Raw Cotton, Sand Stone and Charcoal Ink.
- **Do** set headings in Bodoni Moda and every price, size, date and label in Hanken Grotesk.
- **Do** keep every corner square except colour swatches.
- **Do** use Adire Indigo only for hover, focus and at most one ground per page.
- **Do** use the shop's one easing and three durations for any new motion, and make sure it switches off under reduced motion.
- **Do** keep product photos 3:4 on Sand Stone.

### Don't:
- **Don't** print African patterns, kente stripes or bright fills into buttons, borders, backgrounds or badges; the cloth in the photos already does this.
- **Don't** add rounded corners, pill buttons or card shadows.
- **Don't** introduce a second accent colour.
- **Don't** set body text, prices or buttons in the serif.
- **Don't** animate text on scroll; only photos ease in.
- **Don't** put a small label or eyebrow above a heading; the heading carries itself (a campaign's own label is the exception).
