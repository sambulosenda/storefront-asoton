import { expect, test } from "@playwright/test";
import { acceptCookies } from "./helpers";

test.beforeEach(async ({ page }) => acceptCookies(page));

test("the home hero shows the store's campaign, with the pieces in the picture until it has a photo", async ({ page }) => {
  await page.goto("/");
  // The fixture's campaign entry isn't called "home", like the live store's.
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Made for theBig Day");
  await expect(page.locator("h1 em")).toHaveText("Big Day");
  await expect(page.getByText("African ready-to-wear")).toBeVisible();
  await expect(page.getByRole("link", { name: "Shop women" }).first()).toHaveAttribute("href", "/collections/women");
  await expect(page.getByRole("link", { name: "Shop men" }).first()).toHaveAttribute("href", "/collections/men");
  const pictured = page.getByRole("navigation", { name: "In the picture" });
  await expect(pictured.getByRole("link", { name: /Adire Wrap Dress/ })).toHaveAttribute("href", "/products/adire-wrap-dress");
  await expect(pictured.getByRole("link", { name: /Aso-oke Kaftan/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "New in" })).toBeVisible();
});

test("the home page lists the store's occasions and uses its delivery rules", async ({ page }) => {
  await page.goto("/");
  const occasions = page.getByRole("region", { name: "Shop by occasion" });
  // Church has no pieces yet, so it isn't offered.
  await expect(occasions.getByRole("link")).toHaveCount(2);
  await expect(occasions.getByRole("link", { name: /Church/ })).toHaveCount(0);
  await expect(occasions.getByRole("link", { name: /Wedding guest/ })).toHaveAttribute("href", "/collections/wedding-guest");
  await expect(page.getByText("Ready-to-ship pieces leave us within 1 working day.")).toBeVisible();
  // The shop metafield (£150) wins over the delivery rules' amount.
  await expect(page.getByText(/Complimentary UK delivery (on orders )?over £150/).filter({ visible: true })).toBeVisible();
  await expect(page.getByText(/\[X\]/)).toHaveCount(0);
});

test("ready to ship or made to order is a choice with its arrival date", async ({ page }) => {
  await page.goto("/products/aso-oke-agbada-set");
  const choice = page.getByRole("group", { name: "How would you like it?" });
  const ready = choice.getByRole("button", { name: /Ready to ship/ });
  const made = choice.getByRole("button", { name: /Made to order/ });
  await expect(ready).toHaveAttribute("aria-pressed", "true");
  await expect(ready).toContainText("Dispatched next working day");
  await expect(ready).toContainText(/Arrives \w{3} \d{1,2} \w{3}/);
  await expect(made).toContainText("Made to your size in 14 days");
  await made.click();
  await expect(made).toHaveAttribute("aria-pressed", "true");
  await expect(made).toContainText(/Arrives about/);
  await expect(page.getByText("PURCHASE TYPE")).toHaveCount(0);
});

test("the breadcrumb leaves out retired collections", async ({ page, isMobile }) => {
  test.skip(isMobile, "The breadcrumb is desktop-only");
  await page.goto("/products/adire-kaftan");
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs.getByRole("link", { name: "Men", exact: true })).toBeVisible();
  await expect(crumbs.getByText("old rules")).toHaveCount(0);
});

test("without campaigns or looks, nothing from the design's sample copy shows", async ({ page }) => {
  await page.goto("/collections/women");
  await expect(page.getByRole("heading", { level: 1, name: "Women" })).toBeVisible();
  await expect(page.getByText("Wear it head to toe")).toHaveCount(0);

  await page.goto("/lookbook");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Lookbook");
  await expect(page.getByText(/Indigo Edit|head to toe|\[LOCATION\]/)).toHaveCount(0);
  // The newest pieces stand in for looks.
  await expect(page.getByRole("heading", { level: 2, name: "Adire Wrap Dress" })).toBeVisible();
});

test("the department tiles show the collection's photo when it has one", async ({ page }) => {
  await page.goto("/");
  const tiles = page.getByRole("region", { name: "Shop by department" });
  await expect(tiles.getByRole("link", { name: /^Women/ }).locator("img")).toHaveAttribute("src", /women\.jpg/);
  // The fixture's Men collection has no image and its products have no photos, so that tile keeps its colour.
  await expect(tiles.getByRole("link", { name: /^Men/ }).locator("img")).toHaveCount(0);
});

test("the cloth band only offers cloths the store has pieces in, shown with one of them", async ({ page, isMobile }) => {
  await page.goto("/");
  const band = page.getByRole("region", { name: "Shop by cloth" });
  await expect(band.getByText("Bògòlanfini")).toHaveCount(0);
  if (isMobile) {
    await expect(band.getByRole("link", { name: "Adire Wrap Dress" })).toHaveAttribute("href", "/products/adire-wrap-dress");
    await expect(band.getByRole("link", { name: /^Wax print/ })).toHaveAttribute("href", "/search?q=ankara");
  } else {
    await band.getByRole("button", { name: /Kente/ }).click();
    await expect(band.getByRole("link", { name: "Kente Panel Midi Skirt" })).toHaveAttribute("href", "/products/kente-panel-midi-skirt");
    await expect(band.getByRole("link", { name: "Shop kente" })).toHaveAttribute("href", "/search?q=kente");
  }
});

test("a collection filters and sorts through the URL", async ({ page, isMobile }) => {
  await page.goto("/collections/women");
  await expect(page.getByRole("heading", { level: 1, name: "Women" })).toBeVisible();

  await page.getByRole("button", { name: /^Sort:/ }).first().click();
  await page.getByRole("button", { name: "Price: low to high" }).click();
  await expect(page).toHaveURL(/sort=price-asc/);

  await page.getByRole("button", { name: /^Filter/ }).filter({ visible: true }).first().click();
  const drawer = page.getByRole("dialog");
  if (isMobile) await drawer.getByRole("button", { name: "Size (UK)" }).click();
  // A size with nothing in stock can't be picked.
  await expect(drawer.getByRole("button", { name: "6", exact: true })).toBeDisabled();
  await drawer.getByRole("button", { name: "20", exact: true }).click();
  await drawer.getByRole("button", { name: "Show results" }).click();
  await expect(page.getByText("Nothing matches those filters")).toBeVisible();

  await page.getByRole("button", { name: "Clear all" }).first().click();
  await expect(page).not.toHaveURL(/filter=/);
  await expect(page.getByRole("link", { name: /Adire Wrap Dress/ }).first()).toBeVisible();
});

test("adding to the bag, changing quantity and removing", async ({ page }) => {
  await page.goto("/products/adire-wrap-dress");
  const add = page.getByRole("button", { name: "Select a size" });
  await add.click();
  await expect(page.getByText("Choose a size to continue.")).toBeVisible();

  await page.getByRole("button", { name: "UK 10", exact: true }).click();
  await page.getByRole("button", { name: "Add to bag" }).click();
  await expect(page.getByText("UK 10 in Indigo added to your bag.")).toBeVisible();

  await page.getByRole("button", { name: /^Bag,? \(?1/ }).filter({ visible: true }).click();
  const bag = page.getByRole("dialog");
  await expect(bag.getByText("Adire Wrap Dress")).toBeVisible();

  // The fixture store has two of each size, so the bag stops at two.
  await bag.getByRole("button", { name: "Increase quantity" }).click();
  await expect(bag.getByRole("group", { name: "Quantity" })).toContainText("2");
  await expect(bag.getByText("£370").first()).toBeVisible();
  await expect(bag.getByRole("button", { name: "Increase quantity" })).toBeDisabled();

  await bag.getByRole("button", { name: "Remove" }).click();
  await expect(bag.getByText("Your bag is empty")).toBeVisible();
});

test("a sold-out size offers a back-in-stock email", async ({ page }) => {
  await page.goto("/products/adire-wrap-dress");
  await page.getByRole("button", { name: "UK 18, sold out" }).click();
  await expect(page.getByText("UK 18 is sold out.")).toBeVisible();
  const email = page.getByPlaceholder("Email address");
  await email.fill("not-an-email");
  await page.getByRole("button", { name: "Notify me" }).click();
  await expect(page.getByText("Enter an email address, like name@example.com.")).toBeVisible();
  // What was typed survives the error.
  await expect(email).toHaveValue("not-an-email");

  await email.fill("ada@example.com");
  await page.getByRole("button", { name: "Notify me" }).click();
  await expect(page.getByText("Done. We’ll email you when UK 18 is back.")).toBeVisible();
});

test("the contact form sends a message to the shop", async ({ page }) => {
  await page.goto("/help");
  await page.getByLabel("Name").fill("Ada");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Message").fill("Does the wrap dress come in a longer length?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Thank you. We’ve got your message.")).toBeVisible();
});

test("sizes written as UK, US and EU show the UK size, in size order", async ({ page }) => {
  await page.goto("/products/aso-oke-agbada-set");
  const sizes = page.getByRole("group", { name: "Size (UK)" }).getByRole("button");
  await expect(sizes).toHaveText(["S", "M", "L", "XL", "XXL", "4XL"]);
  await expect(page.getByText("Sizes are UK. Choose one to see its US and EU size.")).toBeVisible();

  await page.getByRole("button", { name: "UK 4XL, US 3XL, EU 4XL" }).click();
  await expect(page.getByText("UK 4XL is US 3XL and EU 4XL.")).toBeVisible();
  await page.getByRole("button", { name: "Add to bag" }).click();
  await page.getByRole("button", { name: /^Bag,? \(?1/ }).filter({ visible: true }).click();
  await expect(page.getByRole("dialog").getByText("Wine and gold · UK 4XL")).toBeVisible();
});

test("search suggests as you type and opens full results", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search" }).filter({ visible: true }).click();
  const box = page.getByRole("searchbox", { name: "Search the shop" });
  await box.fill("adire");
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Suggestions" })).toBeVisible();
  await box.press("Enter");
  await expect(page).toHaveURL(/\/search\?q=adire/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Results for “adire”");
});

test("choosing another country switches prices and keeps the bag", async ({ page }) => {
  await page.goto("/collections/women");
  await expect(page.getByText("£185").first()).toBeVisible();

  await page.getByRole("button", { name: /^Country and currency/ }).filter({ visible: true }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: /United States/ }).click();

  await expect(page.getByText("$240.50").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /United States · USD/ }).first()).toBeAttached();
});

test("the phone menu follows the design's order, with occasions and the store's cloths", async ({ page, isMobile }) => {
  test.skip(!isMobile, "The menu is phone-only");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).filter({ visible: true }).click();
  const menu = page.getByRole("navigation", { name: "Main" });
  const rows = menu.locator(":scope > a:not(:has(span)), :scope > div > button");
  await expect(rows).toHaveText(["Women", "Men", "Kids", "New in", "Accessories", "Occasions", "Shop by cloth"]);
  await menu.getByRole("button", { name: "Occasions" }).click();
  await expect(menu.getByRole("link", { name: "Wedding guest" })).toHaveAttribute("href", "/collections/wedding-guest");
  await expect(menu.getByRole("link", { name: "Church" })).toHaveCount(0);
});

test("a sub-category sits under its department, with its chip selected", async ({ page }) => {
  await page.goto("/collections/women-dresses");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Dresses");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Women" })).toHaveAttribute("href", "/collections/women");
  const chips = page.getByRole("navigation", { name: "Dresses categories" }).filter({ visible: true });
  await expect(chips.getByRole("link", { name: "Dresses" })).toHaveAttribute("aria-current", "page");
  await expect(chips.getByRole("link", { name: "All" })).toHaveAttribute("href", "/collections/women");
});
