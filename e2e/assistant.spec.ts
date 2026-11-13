import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { acceptCookies } from "./helpers";

// Claude is played by the fixture (e2e/fixtures/storefront.cjs): it repeats the question and adds a link.

test.beforeEach(async ({ page }) => acceptCookies(page));

/** No WCAG 2.1 AA problems in the open chat, checked once it has finished sliding in. */
async function expectAccessible(page: Page) {
  await page.getByRole("dialog").evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)));
  const { violations } = await new AxeBuilder({ page }).include("dialog[open]").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`)).toEqual([]);
}

test("the shop assistant answers a suggested question and a typed one, and remembers the chat", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ask us" }).click();
  const chat = page.getByRole("dialog", { name: "Ask us" });
  const log = chat.getByRole("log");

  await chat.getByRole("button", { name: "How long does delivery take?" }).click();
  await expect(log.getByRole("listitem")).toHaveText([
    "You: How long does delivery take?",
    "Assistant: You asked: How long does delivery take? See Delivery details.",
  ]);
  // The suggestions make way for the conversation.
  await expect(chat.getByRole("button", { name: "Can I return something?" })).toHaveCount(0);

  await chat.getByLabel("Your question").fill("Can I return it?");
  await chat.getByLabel("Your question").press("Enter");
  await expect(log.getByRole("listitem")).toHaveCount(4);
  await expect(log.getByRole("listitem").last()).toHaveText("Assistant: You asked: Can I return it? See Delivery details.");
  await expect(chat.getByLabel("Your question")).toHaveValue("");
  await expectAccessible(page);

  // A link in an answer opens its page and closes the chat, which keeps the conversation.
  await log.getByRole("link", { name: "Delivery details" }).last().click();
  await expect(page).toHaveURL(/\/help#delivery$/);
  await expect(chat).toBeHidden();
  await page.getByRole("button", { name: "Ask us" }).click();
  await expect(log.getByRole("listitem")).toHaveCount(4);
});

test("the shop assistant says so when an answer fails, and can try again", async ({ page }) => {
  await page.goto("/faqs");
  await page.getByRole("button", { name: "Ask us" }).click();
  const chat = page.getByRole("dialog", { name: "Ask us" });

  await chat.getByLabel("Your question").fill("Is the API overloaded?");
  await chat.getByRole("button", { name: "Send" }).click();
  await expect(chat.getByRole("alert")).toContainText("Sorry, I couldn’t answer just then.");
  // The question stays, with no half-written answer after it.
  await expect(chat.getByRole("log").getByRole("listitem")).toHaveText(["You: Is the API overloaded?"]);
  await expectAccessible(page);

  await chat.getByRole("button", { name: "Try again" }).click();
  await expect(chat.getByRole("alert")).toContainText("Sorry, I couldn’t answer just then.");
});

test("on a phone the chat button sits above the product page's buy bar", async ({ page, isMobile }) => {
  test.skip(!isMobile, "The buy bar shows on phones only.");
  await page.goto("/products/adire-wrap-dress");
  // The page streams in, so wait for the buy button before scrolling past it.
  await expect(page.getByRole("button", { name: "Select a size" }).first()).toBeVisible();
  await page.mouse.wheel(0, 2400);
  const bar = page.locator("[data-buy-bar]");
  await expect(bar).toBeVisible();
  const [button, buyBar] = await Promise.all([page.getByRole("button", { name: "Ask us" }).boundingBox(), bar.boundingBox()]);
  expect(button!.y + button!.height).toBeLessThanOrEqual(buyBar!.y);
});
