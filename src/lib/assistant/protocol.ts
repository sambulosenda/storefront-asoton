// What the chat panel and /api/chat say to each other. The browser loads this file too, so nothing
// here may import server code.

/** One turn of the conversation. The browser keeps the whole list and sends it with each question. */
export type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * The answer comes back as lines of JSON, one event a line, while the assistant is still writing:
 * `text` adds to the answer, and `error` ends it with words for the customer.
 */
export type ChatEvent = { type: "text"; text: string } | { type: "error"; message: string };

/** The longest question the box takes, in characters. */
export const MAX_QUESTION_LENGTH = 800;
