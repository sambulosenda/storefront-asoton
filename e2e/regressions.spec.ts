import { expect, test } from "@playwright/test";
import { acceptCookies } from "./helpers";

test("the bag opened from the phone menu stays open", async ({ page, isMobile }) => {
  test.skip(!isMobile, "The menu is phone-only");
  await acceptCookies(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("dialog").getByRole("button", { name: /^Bag/ }).click();
  await expect(page.getByRole("dialog", { name: /Your bag/ })).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page.getByRole("dialog", { name: /Your bag/ })).toBeVisible();
});

test("saved cookie choices are confirmed", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Manage preferences" }).click();
  await page.getByRole("button", { name: "Save choices" }).click();
  await expect(page.getByText("Your cookie choices are saved.")).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page.getByText("Your cookie choices are saved.")).toBeVisible();
});

test("search engines get a sitemap, robots rules and product data", async ({ request, page }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/products/adire-wrap-dress");
  expect(sitemap).toContain("/collections/");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap:");

  await page.goto("/products/adire-wrap-dress");
  const data = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
  expect(data["@type"]).toBe("Product");
  expect(data.offers[0].priceCurrency).toBe("GBP");
  expect(await page.locator('meta[property="og:image"]').count()).toBeGreaterThan(0);
});
