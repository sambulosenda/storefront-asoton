// What the chat panel and /api/chat say to each other. The browser loads this file too, so nothing
// here may import server code.

/** One turn of the conversation. The browser keeps the whole list and sends it with each question. */
export type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * The answer comes back as lines of JSON, one event a line, while the assistant is still writing:
 * `text` adds to the answer, `error` ends it with words for the customer, and `whatsapp` means the assistant
 * couldn't help with this one, so the chat offers a WhatsApp message to a person at the shop.
 */
export type ChatEvent = { type: "text"; text: string } | { type: "error"; message: string } | { type: "whatsapp" };

/** The longest question the box takes, in characters. */
export const MAX_QUESTION_LENGTH = 800;
