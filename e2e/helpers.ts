import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Page } from "@playwright/test";

/** Where the fixture writes the WhatsApp messages the shop would have sent (see e2e/fixtures/storefront.cjs). */
export const whatsappOutbox = join(tmpdir(), "storefront-e2e-whatsapp-outbox.jsonl");

/** Dismisses the cookie banner so it doesn't cover the page. */
export async function acceptCookies(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("cookie-consent", JSON.stringify({ analytics: false, marketing: false, preferences: false }));
  });
}
