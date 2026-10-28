// Emails to the shop, sent through Resend (resend.com). Set RESEND_API_KEY and SHOP_EMAIL
// (the inbox that should receive them). Without a verified domain, Resend only sends from
// onboarding@resend.dev, and only to the address the Resend account was made with, which is
// enough for messages to the shop. Set MAIL_FROM once a domain is verified.

const apiKey = process.env.RESEND_API_KEY;
const to = process.env.SHOP_EMAIL;
const from = process.env.MAIL_FROM || "AsoTone website <onboarding@resend.dev>";

export const canEmailShop = Boolean(apiKey && to);

/** Sends a plain-text email to the shop. Returns false when it isn't set up or fails. */
export async function emailShop(args: { subject: string; text: string; replyTo?: string }): Promise<boolean> {
  if (!apiKey || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(10_000),
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: args.subject, text: args.text, reply_to: args.replyTo }),
    });
    if (!res.ok) console.error(`Resend failed: ${res.status} ${await res.text()}`);
    return res.ok;
  } catch (error) {
    console.error("Resend failed", error);
    return false;
  }
}
