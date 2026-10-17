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

  expect(robots).not.toContain("Disallow: /search");

  await page.goto("/products/adire-wrap-dress");
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const data = blocks.map((b) => JSON.parse(b));
  const product = data.find((d) => d["@type"] === "Product");
  expect(product.offers[0].priceCurrency).toBe("GBP");
  expect(product.offers[0].itemCondition).toBe("https://schema.org/NewCondition");
  const trail = data.find((d) => d["@type"] === "BreadcrumbList");
  expect(trail.itemListElement.at(-1).name).toBe(product.name);
  expect(await page.locator('meta[property="og:image"]').count()).toBeGreaterThan(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/products\/adire-wrap-dress$/);
  expect((await page.locator('meta[name="description"]').getAttribute("content"))?.length).toBeGreaterThan(0);

  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https?:\/\/[^/]+\/?$/);
  const home = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((b) => JSON.parse(b));
  expect(home.map((d) => d["@type"])).toEqual(expect.arrayContaining(["Organization", "WebSite"]));

  await page.goto("/search?q=adire");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
});

test("search engines get a 404 status for a product that doesn't exist", async ({ request }) => {
  const googlebot = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
  const res = await request.get("/products/no-such-piece", { headers: { "User-Agent": googlebot } });
  expect(res.status()).toBe(404);
});
