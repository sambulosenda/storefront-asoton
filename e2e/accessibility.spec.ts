import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { acceptCookies } from "./helpers";

const PAGES = [
  "/",
  "/collections/women",
  "/products/adire-wrap-dress",
  "/search?q=adire",
  "/story",
  "/lookbook",
  "/help",
  "/policies/privacy-policy",
  "/this-page-does-not-exist",
];

test.beforeEach(async ({ page }) => acceptCookies(page));

for (const path of PAGES) {
  test(`no WCAG 2.1 AA problems on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`)).toEqual([]);
  });
}

test("no WCAG 2.1 AA problems in the open overlays", async ({ page, isMobile }) => {
  await page.goto("/products/adire-wrap-dress");
  for (const open of [
    () => page.getByRole("button", { name: "Search" }).filter({ visible: true }).click(),
    () => page.getByRole("button", { name: /^Bag/ }).filter({ visible: true }).click(),
    () => page.getByRole("button", { name: "Size guide" }).filter({ visible: true }).first().click(),
    ...(isMobile ? [() => page.getByRole("button", { name: "Open menu" }).filter({ visible: true }).click()] : []),
  ]) {
    await open();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).include("dialog[open]").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`)).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }
});
