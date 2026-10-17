"use client";

import { useEffect } from "react";

export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-x flex flex-1 flex-col items-start gap-3.5 py-24 md:py-32">
      <h1 className="font-display text-[36px] leading-[1.1]">Something went wrong</h1>
      <p className="max-w-[420px] text-[15px] leading-[1.6] text-ink-2">We couldn’t load this page. It’s on our side, not yours. Try again in a moment.</p>
      <button type="button" onClick={reset} className="btn btn-outline mt-2">
        Try again
      </button>
    </main>
  );
}
