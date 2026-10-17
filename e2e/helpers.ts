import type { Page } from "@playwright/test";

/** Dismisses the cookie banner so it doesn't cover the page. */
export async function acceptCookies(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("cookie-consent", JSON.stringify({ analytics: false, marketing: false, preferences: false }));
  });
}
