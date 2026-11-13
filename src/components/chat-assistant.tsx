"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ChatIcon, CloseIcon } from "@/components/icons";
import { Sheet } from "@/components/sheet";
import { MAX_QUESTION_LENGTH, type ChatEvent, type ChatMessage } from "@/lib/assistant/protocol";
import { site } from "@/lib/site";

const STARTERS = ["How long does delivery take?", "How do I find my size?", "Can I return something?"];
const FAILED = "Sorry, that didn’t go through. Check your connection and try again.";

/** An error whose message is written for the customer. Any other error shows the FAILED line instead. */
class ChatError extends Error {}

/** Reads the answer while it is still arriving: lines of JSON, one event each. */
async function* readEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<ChatEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let unfinished = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    // A chunk can end partway through a line, so the last piece waits for the rest of it.
    const lines = (unfinished + decoder.decode(value, { stream: true })).split("\n");
    unfinished = lines.pop() ?? "";
    for (const line of lines) if (line) yield JSON.parse(line) as ChatEvent;
  }
}

/** The shop assistant: a button in the corner of every page, and the chat it opens. */
export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  // The conversation lives here, in the browser. The server keeps nothing, so every question sends all of it.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Sends a conversation that ends with the customer's question, and shows the answer as it is written. */
  async function ask(conversation: ChatMessage[]) {
    setMessages(conversation);
    setError(null);
    setBusy(true);
    let answer = "";
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation }),
      });
      if (!response.ok || !response.body) {
        const refused = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new ChatError(refused?.error ?? FAILED);
      }
      for await (const event of readEvents(response.body)) {
        if (event.type === "error") throw new ChatError(event.message);
        answer += event.text;
        setMessages([...conversation, { role: "assistant", content: answer }]);
      }
      if (!answer) throw new ChatError(FAILED);
    } catch (problem) {
      // A half-written answer goes too, so "Try again" asks the same question afresh.
      setMessages(conversation);
      setError(problem instanceof ChatError ? problem.message : FAILED);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* On phones a product page can show a buy bar along the bottom; the button sits above it. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-20 inline-flex h-12 cursor-pointer items-center gap-2.5 bg-ink px-4 text-paper ring-1 ring-paper/25 md:right-6 md:bottom-6 max-md:[body:has([data-buy-bar])_&]:bottom-[calc(73px+max(12px,env(safe-area-inset-bottom)))]"
      >
        <ChatIcon />
        <span className="label-caps">Ask us</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} placement="right" aria-labelledby="chat-title">
        <ChatPanel
          messages={messages}
          busy={busy}
          error={error}
          onAsk={(question) => ask([...messages, { role: "user", content: question }])}
          onRetry={() => ask(messages)}
          onClose={() => setOpen(false)}
        />
      </Sheet>
    </>
  );
}

function ChatPanel({
  messages,
  busy,
  error,
  onAsk,
  onRetry,
  onClose,
}: {
  messages: ChatMessage[];
  busy: boolean;
  error: string | null;
  onAsk: (question: string) => void;
  onRetry: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const waiting = busy && messages.at(-1)?.role === "user";

  // With a mouse, the cursor starts in the box. On a phone that would open the keyboard over the suggested questions.
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) input.current?.focus();
  }, []);

  // Keep the newest words in view as the answer grows.
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [messages, busy, error]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || busy) return;
    setDraft("");
    onAsk(question);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[60px] flex-none items-center justify-between gap-4 border-b border-line pr-2 pl-4 md:h-auto md:py-[18px] md:pr-5 md:pl-8">
        <h2 id="chat-title" className="font-display text-[24px] leading-[1.2] md:text-[28px]">
          Ask us
        </h2>
        <button type="button" aria-label="Close chat" onClick={onClose} className="inline-flex size-11 cursor-pointer items-center justify-center">
          <CloseIcon />
        </button>
      </div>

      <div className="flex min-h-0 flex-auto flex-col gap-6 overflow-y-auto px-4 py-6 md:px-8">
        <p className="text-[15px] leading-[1.6] text-ink-2">
          Ask about delivery, returns, sizes or caring for your piece. An AI assistant answers here, so for anything about your own
          order, email{" "}
          <a href={`mailto:${site.email}`} className="underline-offset-4">
            {site.email}
          </a>
          .
        </p>

        {messages.length === 0 && (
          <ul className="flex flex-col border-t border-line">
            {STARTERS.map((question) => (
              <li key={question}>
                <button
                  type="button"
                  onClick={() => onAsk(question)}
                  className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 border-b border-line text-left text-[15px]"
                >
                  {question}
                  <ArrowRight size={18} className="flex-none" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* aria-busy holds screen readers back until the answer is whole, rather than reading it word by word. */}
        <div role="log" aria-label="Conversation" aria-busy={busy}>
          <ol className="flex flex-col gap-3 text-[15px] leading-[1.55]">
            {messages.map((message, i) => (
              <li
                key={i}
                className={`max-w-[85%] px-4 py-3 wrap-anywhere whitespace-pre-wrap ${message.role === "user" ? "self-end bg-ink text-paper" : "self-start bg-stone"}`}
              >
                <span className="sr-only">{message.role === "user" ? "You: " : "Assistant: "}</span>
                {message.role === "user" ? message.content : <Answer text={message.content} onNavigate={onClose} />}
              </li>
            ))}
          </ol>
        </div>

        {waiting && (
          <p role="status" className="text-[14px] text-ink-2">
            Writing…
          </p>
        )}

        {error && (
          <div role="alert" className="flex flex-col items-start gap-1 text-[14px] leading-[1.55] text-error">
            <p>{error}</p>
            <button type="button" onClick={onRetry} className="min-h-9 cursor-pointer underline underline-offset-4">
              Try again
            </button>
          </div>
        )}
        <div ref={end} />
      </div>

      <form onSubmit={submit} className="flex flex-none gap-2 border-t border-line px-4 pt-4 pb-[max(16px,env(safe-area-inset-bottom))] md:px-8 md:pb-6">
        <label htmlFor="chat-question" className="sr-only">
          Your question
        </label>
        <input
          id="chat-question"
          ref={input}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={MAX_QUESTION_LENGTH}
          placeholder="Type your question"
          autoComplete="off"
          enterKeyHint="send"
          className="h-[52px] min-w-0 flex-1 border border-line bg-white px-3.5"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={busy || !draft.trim()}
          className="inline-flex size-[52px] flex-none cursor-pointer items-center justify-center bg-ink text-paper disabled:cursor-default disabled:opacity-40"
        >
          <ArrowRight />
        </button>
      </form>
    </div>
  );
}

// A link as the assistant writes it: [label](/path), or to a full https, mailto or tel address.
const LINK = /\[([^\]]+)\]\(((?:\/(?!\/)|https:\/\/|mailto:|tel:)[^\s)]*)\)/g;

/** An answer's text, with its links made into real ones. A link into the shop closes the chat on the way. */
function Answer({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  const parts: ReactNode[] = [];
  let shown = 0;
  for (const match of text.matchAll(LINK)) {
    const [whole, label, href] = match;
    const start = match.index ?? 0;
    parts.push(text.slice(shown, start));
    parts.push(
      href.startsWith("/") ? (
        <Link key={start} href={href} onClick={onNavigate} className="underline-offset-4">
          {label}
        </Link>
      ) : (
        <a key={start} href={href} className="underline-offset-4">
          {label}
        </a>
      ),
    );
    shown = start + whole.length;
  }
  parts.push(text.slice(shown));
  return <>{parts}</>;
}
