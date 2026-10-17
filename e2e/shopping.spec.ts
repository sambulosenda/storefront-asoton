import { expect, test } from "@playwright/test";
import { acceptCookies } from "./helpers";

test.beforeEach(async ({ page }) => acceptCookies(page));

test("without a campaign, the home hero leads with the newest piece", async ({ page }) => {
  await page.goto("/");
  // The fixture store has no "home" campaign metaobject, so none of the design's sample copy shows.
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Adire Wrap Dress");
  await expect(page.getByText("The Indigo Edit")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Shop now" }).first()).toHaveAttribute("href", "/products/adire-wrap-dress");
  await expect(page.getByRole("heading", { name: "New in" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Adire Wrap Dress/ }).first()).toBeVisible();
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
