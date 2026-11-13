// The shop assistant's one endpoint. The chat panel posts the conversation so far, this sends it
// to Claude with the shop's facts, and the answer streams back a few words at a time.

import Anthropic from "@anthropic-ai/sdk";
import { allowQuestion, assistantEnabled, readMessages, systemPrompt } from "@/lib/assistant";
import type { ChatEvent } from "@/lib/assistant/protocol";
import { site } from "@/lib/site";

// The smallest and cheapest current Claude model, which is plenty for answering from a page of facts.
// Changing model is this one line: "claude-sonnet-5-5" is the next step up, at about twenty times the price.
const MODEL = "claude-haiku-5-5";

const FAILED = `Sorry, I couldn’t answer just then. Please try again, or email ${site.email}.`;
const DECLINED = `Sorry, I can’t help with that. For anything about the shop, email ${site.email}.`;

// Made on the first question rather than when the file loads, so a build without a key still works.
// It reads the key from ANTHROPIC_API_KEY by itself. The key stays on the server: the browser only ever talks to this route.
let client: Anthropic | undefined;

export async function POST(request: Request) {
  if (!assistantEnabled) return Response.json({ error: "The assistant isn’t switched on yet." }, { status: 503 });

  const address = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!allowQuestion(address)) {
    return Response.json(
      { error: `That’s a lot of questions in a short time. Please try again in a few minutes, or email ${site.email}.` },
      { status: 429 },
    );
  }

  const messages = readMessages(await request.json().catch(() => null));
  if (!messages) return Response.json({ error: "That message couldn’t be read. Please try again." }, { status: 400 });

  client ??= new Anthropic({ maxRetries: 1, timeout: 30_000 });

  // The request. Claude keeps no memory between calls: each one carries the whole conversation
  // (`messages`) and the instructions (`system`), and is billed for every token of both.
  const stream = client.messages.stream({
    model: MODEL,
    // The most this one answer may cost: output tokens, including any thinking the model does first.
    max_tokens: 1024,
    // How hard the model thinks before answering. "low" is the cheapest and quickest, and right for chat.
    output_config: { effort: "low" },
    // The system prompt is the same for every customer, so it's marked to be cached: after the first
    // question, Anthropic reads it back at a tenth of the price for the next five minutes.
    system: [{ type: "text", text: await systemPrompt(), cache_control: { type: "ephemeral" } }],
    messages,
  });

  // Passes the answer on as it is written, one line of JSON per event (see ChatEvent).
  const encoder = new TextEncoder();
  let open = true;
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatEvent) => {
        if (open) controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      stream.on("text", (text) => send({ type: "text", text }));
      try {
        // Waits for the end of the answer. Anything that went wrong on the way is thrown here.
        const message = await stream.finalMessage();
        // The model's safety checks can decline a question. That arrives as a normal reply with this reason.
        if (message.stop_reason === "refusal") send({ type: "error", message: DECLINED });
        // What the question cost, in tokens. After the first one, most of the input should be "from cache".
        const { input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens } = message.usage;
        console.log(
          `[assistant] in ${input_tokens}, from cache ${cache_read_input_tokens ?? 0}, to cache ${cache_creation_input_tokens ?? 0}, out ${output_tokens}`,
        );
      } catch (error) {
        // The customer closed the chat mid-answer (see cancel below): nobody is left to tell.
        if (error instanceof Anthropic.APIUserAbortError) return;
        if (error instanceof Anthropic.AuthenticationError) console.error("[assistant] ANTHROPIC_API_KEY was refused. Check the key.");
        else if (error instanceof Anthropic.RateLimitError) console.error("[assistant] Anthropic rate or spend limit reached.");
        else console.error("[assistant] request failed:", error instanceof Error ? error.message : error);
        send({ type: "error", message: FAILED });
      } finally {
        if (open) controller.close();
      }
    },
    // The browser went away. Stop the model too, so the shop doesn't pay for an answer nobody reads.
    cancel() {
      open = false;
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
