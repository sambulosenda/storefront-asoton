// The shop's WhatsApp webhook: the address Meta calls with every message sent to the shop's WhatsApp number.
// The work is in src/lib/whatsapp.ts.

import { after } from "next/server";
import { answer, firstTime, inTurn, readIncoming, signedByMeta, whatsappConfig } from "@/lib/whatsapp";

/**
 * Meta checks the address once, when the webhook is set up in the developer dashboard: it sends the verify
 * token from WHATSAPP_VERIFY_TOKEN and expects its challenge back.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const token = process.env.WHATSAPP_VERIFY_TOKEN;
  if (token && params.get("hub.mode") === "subscribe" && params.get("hub.verify_token") === token) {
    return new Response(params.get("hub.challenge") ?? "", { headers: { "Content-Type": "text/plain" } });
  }
  return new Response("Forbidden", { status: 403 });
}

/**
 * New messages. Meta wants a quick 200 and sends the message again if it doesn't get one, so the answer is
 * written and sent after the response (`after`), and a message that comes twice is answered once.
 */
export async function POST(request: Request) {
  const config = whatsappConfig();
  if (!config) return Response.json({ error: "WhatsApp isn’t switched on yet." }, { status: 503 });

  // The signature covers the exact bytes Meta sent, so it's checked on the raw body before parsing.
  const raw = await request.text();
  if (!signedByMeta(raw, request.headers.get("x-hub-signature-256"), config.appSecret)) {
    return Response.json({ error: "Not signed by Meta." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Not JSON." }, { status: 400 });
  }

  for (const message of readIncoming(body, config.phoneNumberId)) {
    if (firstTime(message.id)) after(() => inTurn(message.from, () => answer(message, config)));
  }
  return new Response(null, { status: 200 });
}
