"use client";

import { useActionState } from "react";
import { contactAction } from "@/lib/actions";
import { site } from "@/lib/site";

const field = "h-[52px] border border-line bg-white px-3.5";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(contactAction, null);
  const values = state?.values;

  if (state?.ok) {
    return (
      <div role="status" className="flex min-w-0 flex-[3_1_360px] flex-col gap-3 bg-stone p-6 md:p-8">
        <p className="font-display text-[28px] leading-[1.15]">Thank you. We’ve got your message.</p>
        <p className="text-[15px] leading-[1.6] text-ink-2">
          We reply within {site.replyDays} working days.
        </p>
      </div>
    );
  }

  return (
    <form key={JSON.stringify(values)} action={formAction} noValidate className="flex min-w-0 flex-[3_1_360px] flex-col gap-5">
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="c-name" className="text-[13px] font-medium">
            Name
          </label>
          <input id="c-name" name="name" type="text" autoComplete="name" defaultValue={values?.name} className={field} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="c-email" className="text-[13px] font-medium">
            Email
          </label>
          <input id="c-email" name="email" type="email" autoComplete="email" defaultValue={values?.email} className={field} />
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="c-order" className="text-[13px] font-medium">
            Order number <span className="font-normal text-ink-2">(optional)</span>
          </label>
          <input id="c-order" name="order" type="text" defaultValue={values?.order} className={field} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="c-topic" className="text-[13px] font-medium">
            Topic
          </label>
          <select id="c-topic" name="topic" defaultValue={values?.topic} className={`${field} px-3`}>
            <option>My order</option>
            <option>Returns</option>
            <option>Sizing and fit</option>
            <option>Something else</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="c-msg" className="text-[13px] font-medium">
          Message
        </label>
        <textarea id="c-msg" name="message" rows={5} defaultValue={values?.message} className="resize-y border border-line bg-white px-3.5 py-3 leading-[1.5]" />
      </div>
      {state && !state.ok && (
        <p role="alert" className="text-[14px] text-error">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-ink self-start px-9">
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
