import { createHmac, randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { expect, test, type APIRequestContext } from "@playwright/test";
import { whatsappOutbox } from "./helpers";

// Meta is played by the test: it posts to /api/whatsapp the way Meta does, signed with the test app secret
// (playwright.config.ts). Claude and Meta's sending API are played by the fixture (e2e/fixtures/storefront.cjs):
// Claude repeats the question and adds a link, and what the shop sends is written to the outbox file.

const PHONE_NUMBER_ID = "100000000000001";

// The checks are on the server, not the page, so one browser's run is enough.
test.skip(({ isMobile }) => isMobile, "Server-only, so the desktop run covers it.");
// The outbox is one file, so these run one after another.
test.describe.configure({ mode: "serial" });
test.beforeEach(() => writeFileSync(whatsappOutbox, ""));

type Sent = { url: string; to: string; type: string; text: { body: string } };

function outbox(): Sent[] {
  return readFileSync(whatsappOutbox, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

/** Waits for the shop to have sent `count` messages, and returns them. */
async function sent(count: number): Promise<Sent[]> {
  await expect.poll(() => outbox().length, { timeout: 10_000 }).toBe(count);
  return outbox();
}

/** A new customer number each time, so earlier runs' question counts and conversations don't carry over. */
const customer = () => `4477009${String(Math.floor(Math.random() * 1e5)).padStart(5, "0")}`;

/** What Meta sends when a customer writes to the shop. */
function incoming(from: string, message: Record<string, unknown>, phoneNumberId = PHONE_NUMBER_ID) {
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "1818100409337134",
        changes: [
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: { display_phone_number: "15551667058", phone_number_id: phoneNumberId },
              contacts: [{ profile: { name: "Test Customer" }, wa_id: from }],
              messages: [{ from, id: `wamid.${randomUUID()}`, timestamp: "1763400000", ...message }],
            },
          },
        ],
      },
    ],
  };
}

const text = (body: string) => ({ type: "text", text: { body } });

/** Posts to the webhook as Meta does, signed with the app secret unless `signature` says otherwise. */
function post(request: APIRequestContext, payload: unknown, signature?: string) {
  const data = JSON.stringify(payload);
  const signed = `sha256=${createHmac("sha256", "test-app-secret").update(data).digest("hex")}`;
  return request.post("/api/whatsapp", { data, headers: { "content-type": "application/json", "x-hub-signature-256": signature ?? signed } });
}

test("Meta's check of the webhook gets its challenge back only with the verify token", async ({ request }) => {
  const right = await request.get("/api/whatsapp?hub.mode=subscribe&hub.verify_token=test-verify-token&hub.challenge=1158201444");
  expect(right.status()).toBe(200);
  expect(await right.text()).toBe("1158201444");

  const wrong = await request.get("/api/whatsapp?hub.mode=subscribe&hub.verify_token=guess&hub.challenge=1158201444");
  expect(wrong.status()).toBe(403);
});

test("a customer's WhatsApp message gets the assistant's answer, with links as full web addresses", async ({ request }) => {
  const from = customer();
  expect((await post(request, incoming(from, text("Do you deliver to Ghana?")))).status()).toBe(200);

  const [reply] = await sent(1);
  expect(reply.url).toBe(`https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`);
  expect(reply.to).toBe(from);
  expect(reply.type).toBe("text");
  expect(reply.text.body).toMatch(/^You asked: Do you deliver to Ghana\? See Delivery details: https?:\/\/\S+\/help#delivery\.$/);

  // The next message in the conversation is answered too.
  await post(request, incoming(from, text("And to Kenya?")));
  expect((await sent(2))[1].text.body).toMatch(/^You asked: And to Kenya\?/);
});

test("a message Meta sends twice is answered once", async ({ request }) => {
  const payload = incoming(customer(), text("Do you make school uniforms?"));
  await post(request, payload);
  await sent(1);
  expect((await post(request, payload)).status()).toBe(200);
  // Long enough for a second answer to have arrived, had one been sent.
  await new Promise((resolve) => setTimeout(resolve, 1500));
  expect(outbox()).toHaveLength(1);
});

test("unsigned posts, other numbers' messages and receipts get no answer", async ({ request }) => {
  const from = customer();
  expect((await post(request, incoming(from, text("Hello")), "sha256=00")).status()).toBe(401);
  expect((await post(request, incoming(from, text("Hello")), "")).status()).toBe(401);
  expect((await post(request, incoming(from, text("Hello"), "999999999999999"))).status()).toBe(200);
  const receipt = incoming(from, {});
  const value = receipt.entry[0].changes[0].value as Record<string, unknown>;
  delete value.messages;
  value.statuses = [{ id: "wamid.x", status: "read", recipient_id: from }];
  expect((await post(request, receipt)).status()).toBe(200);

  await new Promise((resolve) => setTimeout(resolve, 1500));
  expect(outbox()).toHaveLength(0);
});

test("a photo, and an answer that fails, still get a reply the customer can act on", async ({ request }) => {
  const from = customer();
  await post(request, incoming(from, { type: "image", image: { id: "media-1", mime_type: "image/jpeg" } }));
  expect((await sent(1))[0].text.body).toMatch(/^Sorry, I can only read text messages\./);

  await post(request, incoming(from, text("Is the API overloaded?")));
  expect((await sent(2))[1].text.body).toMatch(/^Sorry, I couldn’t answer just then\./);
});
