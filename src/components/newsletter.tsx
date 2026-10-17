"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { ArrowRight } from "@/components/icons";
import { subscribeAction } from "@/lib/actions";

/** "Letters from the studio" sign-up, at the foot of the home page. */
export function Newsletter() {
  const [state, formAction, pending] = useActionState(subscribeAction, null);
  const id = useId();

  return (
    <section aria-labelledby={`${id}-title`} className="border-t border-line">
      <div className="page-x flex flex-col gap-3 py-14 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-x-16 md:gap-y-10 md:py-24">
        <div className="flex max-w-[560px] flex-col gap-3 md:flex-[1_1_420px] md:gap-4">
          <h2 id={`${id}-title`} className="font-display text-[34px] leading-[1.05] md:text-[clamp(36px,3.4vw,48px)] md:tracking-[-0.01em]">
            Letters from the studio
          </h2>
          <p className="mb-3 text-[15px] leading-[1.6] text-ink-2 md:mb-0 md:text-[16px]">
            New pieces, restocks and the stories behind the cloth. Once or twice a month, never more.
          </p>
        </div>
        <form key={state?.values?.email} action={formAction} noValidate className="flex max-w-[560px] flex-col gap-3 md:flex-[1_1_420px]">
          <label htmlFor={`${id}-email`} className="text-[11px] tracking-[0.14em] text-ink-2 uppercase md:text-[12px]">
            Email address
          </label>
          <div className="flex items-center border-b border-ink">
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state?.values?.email}
              placeholder="you@example.com"
              aria-describedby={state ? `${id}-status` : undefined}
              className="h-[52px] min-w-0 flex-1 bg-transparent placeholder:text-muted focus:outline-none"
            />
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-[52px] cursor-pointer items-center gap-2.5 pl-4 text-[12px] font-semibold tracking-[0.14em] uppercase md:pl-6 md:text-[13px]"
            >
              Subscribe
              <ArrowRight size={16} className="hidden md:block" />
            </button>
          </div>
          {state && (
            <p id={`${id}-status`} role="status" className={`text-[13px] ${state.ok ? "" : "text-error"}`}>
              {state.message}
            </p>
          )}
          <p className="hidden text-[12px] text-ink-2 md:block">
            Unsubscribe at any time. Read our{" "}
            <Link href="/policies/privacy-policy" className="text-ink-2">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      </div>
    </section>
  );
}
