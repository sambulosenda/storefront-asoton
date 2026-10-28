import { defineConfig, devices } from "@playwright/test";

const port = 3100;

// The tests run against a production build that talks to an in-memory store
// (e2e/fixtures/storefront.cjs) instead of Shopify, so they need no token or network.
export default defineConfig({
  testDir: "e2e",
  // The fixture store keeps one shared bag, so tests run one at a time.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${port}`,
    url: `http://localhost:${port}`,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_OPTIONS: "--require ./e2e/fixtures/storefront.cjs",
      // Empty values win over .env.local, so a local run never reaches the real store.
      SHOPIFY_STORE_DOMAIN: "",
      SHOPIFY_STOREFRONT_ACCESS_TOKEN: "",
      // Emails to the shop go to the fixture, which accepts them without sending.
      RESEND_API_KEY: "test",
      SHOP_EMAIL: "shop@example.com",
    },
  },
});
