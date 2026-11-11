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
  expect(sitemap).toContain("/collections/womens-clothing<");
  expect(sitemap).not.toContain("/collections/church<");
  expect(sitemap).not.toContain("/collections/frontpage<");
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

test("Google Analytics waits for analytics consent", async ({ page }) => {
  const requests: string[] = [];
  await page.route("https://www.googletagmanager.com/**", (route) => {
    requests.push(route.request().url());
    return route.fulfill({ status: 200, contentType: "text/javascript", body: "" });
  });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Reject all" })).toBeVisible();
  await page.waitForTimeout(500);
  expect(requests).toHaveLength(0);

  await page.getByRole("button", { name: "Reject all" }).click();
  await page.reload();
  await page.waitForTimeout(500);
  expect(requests).toHaveLength(0);

  await page.getByRole("contentinfo").getByRole("button", { name: "Cookie settings" }).first().click();
  await page.getByRole("button", { name: "Accept all" }).last().click();
  await expect.poll(() => requests.length).toBeGreaterThan(0);
  expect(requests[0]).toContain("id=G-TEST000000");
  const disabled = () => page.evaluate(() => (window as unknown as Record<string, boolean>)["ga-disable-G-TEST000000"]);
  expect(await disabled()).toBe(false);

  // Turning analytics off afterwards switches GA off on the open page.
  await page.getByRole("contentinfo").getByRole("button", { name: "Cookie settings" }).first().click();
  await page.getByRole("button", { name: "Reject all" }).last().click();
  await expect.poll(disabled).toBe(true);
});

test("shopper tracking waits for analytics consent, then follows the visit", async ({ page }) => {
  // Google Analytics follows the same consent; kept off the network here.
  await page.route("https://www.googletagmanager.com/**", (route) => route.fulfill({ status: 200, contentType: "text/javascript", body: "" }));
  const requests: string[] = [];
  await page.route(/^https:\/\/eu(-assets)?\.i\.posthog\.com\//, (route) => {
    requests.push(route.request().url());
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  // The steps the shop records, as it records them.
  await page.addInitScript(() => {
    const steps: string[] = [];
    (window as unknown as { steps: string[] }).steps = steps;
    window.addEventListener("shop:track", (e) => steps.push((e as CustomEvent<{ event: string }>).detail.event));
  });
  const steps = () => page.evaluate(() => (window as unknown as { steps: string[] }).steps);
  const openBag = async () => {
    await page.getByRole("button", { name: /^Bag,? \(?1/ }).filter({ visible: true }).click();
    await expect(page.getByRole("dialog").getByText("Adire Wrap Dress")).toBeVisible();
  };

  // Before an answer nothing is recorded or sent, even when the shopper presses the button early.
  await page.goto("/products/adire-wrap-dress");
  await expect(page.getByRole("button", { name: "Reject all" })).toBeVisible();
  await page.waitForTimeout(500);
  expect(requests).toHaveLength(0);
  expect(await steps()).toEqual([]);

  // A yes loads PostHog and counts the page they were already on.
  await page.getByRole("button", { name: "Accept all" }).click();
  await expect.poll(steps).toEqual(["product_viewed"]);
  await expect.poll(() => requests.length).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Select a size" }).first().click();
  await expect.poll(steps).toContain("size_needed");
  await page.getByRole("button", { name: "UK 10", exact: true }).click();
  await page.getByRole("button", { name: "Add to bag" }).first().click();
  await expect(page.getByText("UK 10 in Indigo added to your bag.")).toBeVisible();
  await expect.poll(steps).toContain("added_to_bag");
  await openBag();
  await expect.poll(steps).toContain("bag_viewed");
  await page.keyboard.press("Escape");

  // A later no stops it on the open page.
  await page.getByRole("contentinfo").getByRole("button", { name: "Cookie settings" }).first().click();
  await page.getByRole("button", { name: "Reject all" }).last().click();
  const before = (await steps()).length;
  await openBag();
  expect(await steps()).toHaveLength(before);
});

test("the old FAQ address opens the FAQ page, with its questions for search engines", async ({ page }) => {
  await acceptCookies(page);
  await page.goto("/pages/faqs");
  await expect(page).toHaveURL(/\/faqs$/);
  await expect(page.getByRole("heading", { level: 1, name: "Questions and answers" })).toBeVisible();
  const question = page.getByText("Can I return something?");
  await question.click();
  await expect(page.getByText(/You can return ready-to-ship pieces within 30 days/)).toBeVisible();
  const data = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = data.map((d) => JSON.parse(d)).find((d) => d["@type"] === "FAQPage");
  expect(faq.mainEntity.length).toBeGreaterThan(10);
});
