// The shop assistant on WhatsApp. Meta sends each message a customer writes to the shop's WhatsApp number
// to /api/whatsapp (src/app/api/whatsapp/route.ts). This checks it really came from Meta, asks Claude with
// the same facts as the website chat, and sends the answer back through Meta's WhatsApp Cloud API.

import { createHmac, timingSafeEqual } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { allowQuestion, MODEL, systemPrompt } from "@/lib/assistant";
import { MAX_QUESTION_LENGTH, type ChatMessage } from "@/lib/assistant/protocol";
import { site, siteUrl } from "@/lib/site";

/** Meta's API. The version is the one the app was set up with in the Meta developer dashboard. */
const GRAPH_URL = "https://graph.facebook.com/v25.0";

const FAILED = `Sorry, I couldn’t answer just then. Please try again, or email ${site.email}.`;
const DECLINED = `Sorry, I can’t help with that. For anything about the shop, email ${site.email}.`;
const TOO_MANY = `That’s a lot of questions in a short time. Please try again in a few minutes, or email ${site.email}.`;
const TEXT_ONLY = `Sorry, I can only read text messages. Please type your question, or email ${site.email}.`;

/**
 * Added after the shop's facts, so the cached part of the instructions stays the same as the website chat's.
 * The links themselves are rewritten as full web addresses after Claude answers (see forWhatsApp).
 */
const ON_WHATSAPP = `This conversation is on WhatsApp, not in the chat on the website: the customer messaged the shop's WhatsApp number, and may not have the website open. Everything above still applies. Keep writing links to pages as before; they are turned into full web addresses before the customer sees them.`;

export type WhatsAppConfig = { accessToken: string; appSecret: string; phoneNumberId: string };

/**
 * The settings, or null until they are all there. Make them in the Meta developer dashboard (see the README).
 * The assistant also needs ANTHROPIC_API_KEY, as on the website.
 */
export function whatsappConfig(): WhatsAppConfig | null {
  const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_APP_SECRET, WHATSAPP_PHONE_NUMBER_ID, ANTHROPIC_API_KEY } = process.env;
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_APP_SECRET || !WHATSAPP_PHONE_NUMBER_ID || !ANTHROPIC_API_KEY) return null;
  return { accessToken: WHATSAPP_ACCESS_TOKEN, appSecret: WHATSAPP_APP_SECRET, phoneNumberId: WHATSAPP_PHONE_NUMBER_ID };
}

/**
 * Whether a request really came from Meta. Meta signs the exact body it sends with the app secret and puts the
 * signature in the X-Hub-Signature-256 header. Anyone can post to the address, so nothing unsigned is answered.
 */
export function signedByMeta(body: string, header: string | null, appSecret: string): boolean {
  if (!header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(body).digest();
  const given = Buffer.from(header.slice("sha256=".length), "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** A message a customer sent. `text` is null for anything that isn't words: a photo, a voice note, a sticker. */
export type IncomingMessage = { id: string; from: string; text: string | null };

/**
 * The customers' messages in what Meta sent. The same address also gets delivery and read receipts for the
 * shop's own messages, and could carry another number's messages, so only messages to this number come out.
 */
export function readIncoming(body: unknown, phoneNumberId: string): IncomingMessage[] {
  const incoming: IncomingMessage[] = [];
  const entries = (body as { entry?: unknown } | null)?.entry;
  if (!Array.isArray(entries)) return incoming;
  for (const entry of entries) {
    for (const change of (entry as { changes?: unknown[] })?.changes ?? []) {
      const value = (change as { field?: string; value?: Record<string, unknown> })?.value;
      if ((change as { field?: string }).field !== "messages" || !value) continue;
      if ((value.metadata as { phone_number_id?: string } | undefined)?.phone_number_id !== phoneNumberId) continue;
      for (const raw of (value.messages as unknown[] | undefined) ?? []) {
        const message = raw as {
          id?: unknown;
          from?: unknown;
          type?: string;
          text?: { body?: unknown };
          button?: { text?: unknown };
          interactive?: { button_reply?: { title?: unknown }; list_reply?: { title?: unknown } };
        };
        if (typeof message.id !== "string" || typeof message.from !== "string") continue;
        const words =
          message.type === "text" ? message.text?.body
          : message.type === "button" ? message.button?.text
          : message.type === "interactive" ? (message.interactive?.button_reply?.title ?? message.interactive?.list_reply?.title)
          : undefined;
        incoming.push({ id: message.id, from: message.from, text: typeof words === "string" && words.trim() ? words : null });
      }
    }
  }
  return incoming;
}

// What follows lives in this server's memory, like the website chat's question count. A host like Vercel runs
// several servers and restarts them, so a long pause or a busy day can lose the thread of a conversation: the
// assistant then answers the latest message on its own. Keeping chats for good needs a database.

/** Meta can send the same message more than once. Each is answered once. */
const answered = new Set<string>();

/** True the first time a message id is seen. */
export function firstTime(id: string): boolean {
  if (answered.has(id)) return false;
  answered.add(id);
  if (answered.size > 5000) answered.delete(answered.values().next().value!);
  return true;
}

/** How long a conversation is remembered after its last message, and how much of it goes to Claude. */
const FORGET_AFTER_MS = 30 * 60_000;
const MAX_MESSAGES = 20;
const chats = new Map<string, { messages: ChatMessage[]; at: number }>();

function conversation(from: string, now: number): ChatMessage[] {
  const chat = chats.get(from);
  if (!chat || now - chat.at > FORGET_AFTER_MS) return [];
  return chat.messages;
}

function rememberChat(from: string, messages: ChatMessage[], now: number) {
  // The API wants the conversation to open with the customer, so the cut lands on a question.
  const recent = messages.slice(-MAX_MESSAGES);
  chats.set(from, { messages: recent.slice(recent.findIndex((m) => m.role === "user")), at: now });
  if (chats.size > 5000) {
    for (const [key, chat] of chats) if (now - chat.at > FORGET_AFTER_MS) chats.delete(key);
  }
}

/**
 * One customer's messages are answered one at a time, in order, so two sent quickly get two answers that
 * follow the conversation rather than racing each other.
 */
const queues = new Map<string, Promise<void>>();

export function inTurn(from: string, task: () => Promise<void>): Promise<void> {
  const next = (queues.get(from) ?? Promise.resolve()).then(task, task);
  queues.set(from, next);
  next.finally(() => {
    if (queues.get(from) === next) queues.delete(from);
  });
  return next;
}

/**
 * Claude's answer as WhatsApp text. WhatsApp shows plain text and turns web addresses into links itself, so
 * "[Delivery details](/help#delivery)" becomes "Delivery details: https://…/help#delivery".
 */
export function forWhatsApp(answer: string): string {
  return answer
    .replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, (_, label: string, path: string) => `${label}: ${siteUrl}${path}`)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "$1: $2")
    .trim()
    .slice(0, 4096);
}

// Made on the first message rather than when the file loads, so a build without a key still works.
let client: Anthropic | undefined;

/** Answers one customer message and sends the answer to them on WhatsApp. Never throws. */
export async function answer(message: IncomingMessage, config: WhatsAppConfig): Promise<void> {
  try {
    if (message.text === null) return void (await sendText(message.from, TEXT_ONLY, config));
    if (!allowQuestion(`whatsapp:${message.from}`)) return void (await sendText(message.from, TOO_MANY, config));

    const now = Date.now();
    const messages: ChatMessage[] = [
      ...conversation(message.from, now),
      { role: "user", content: message.text.slice(0, MAX_QUESTION_LENGTH) },
    ];

    client ??= new Anthropic({ maxRetries: 1, timeout: 30_000 });
    const reply = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      output_config: { effort: "low" },
      // The shop's facts are cached as on the website; the WhatsApp note comes after, so it doesn't change them.
      system: [
        { type: "text", text: await systemPrompt(), cache_control: { type: "ephemeral" } },
        { type: "text", text: ON_WHATSAPP },
      ],
      messages,
    });
    const { input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens } = reply.usage;
    console.log(
      `[whatsapp] in ${input_tokens}, from cache ${cache_read_input_tokens ?? 0}, to cache ${cache_creation_input_tokens ?? 0}, out ${output_tokens}`,
    );

    const text = reply.content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("");
    if (reply.stop_reason === "refusal" || !text.trim()) return void (await sendText(message.from, DECLINED, config));

    // Remembered only once the customer has it, so a failed send doesn't leave an answer they never saw in the chat.
    if (await sendText(message.from, forWhatsApp(text), config)) {
      rememberChat(message.from, [...messages, { role: "assistant", content: text }], Date.now());
    }
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) console.error("[whatsapp] ANTHROPIC_API_KEY was refused. Check the key.");
    else if (error instanceof Anthropic.RateLimitError) console.error("[whatsapp] Anthropic rate or spend limit reached.");
    else console.error("[whatsapp] answering failed:", error instanceof Error ? error.message : error);
    await sendText(message.from, FAILED, config).catch(() => {});
  }
}

/** Sends a WhatsApp text message from the shop's number. True once Meta has accepted it. */
async function sendText(to: string, body: string, config: WhatsAppConfig): Promise<boolean> {
  const response = await fetch(`${GRAPH_URL}/${config.phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, type: "text", text: { body } }),
  });
  if (!response.ok) {
    // 401 usually means the access token has expired (the test token lasts a day). The details are in the body.
    console.error(`[whatsapp] sending failed (${response.status}):`, (await response.text().catch(() => "")).slice(0, 500));
  }
  return response.ok;
}
