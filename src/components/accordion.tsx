"use client";

import { useId, useState, type ReactNode } from "react";
import { MinusIcon, PlusIcon } from "@/components/icons";

/** Product detail panels. The first is open to start with. */
export function Accordion({ panels }: { panels: { title: string; body: ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();

  return (
    <div className="border-t border-line">
      {panels.map((panel, i) => {
        const isOpen = open === i;
        return (
          <div key={panel.title} className="border-b border-line">
            <h2>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${id}-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 text-left text-[15px] font-medium md:min-h-[60px]"
              >
                {panel.title}
                {isOpen ? <MinusIcon size={18} /> : <PlusIcon size={18} />}
              </button>
            </h2>
            <div id={`${id}-${i}`} hidden={!isOpen} className="max-w-[480px] pb-5 text-[15px] leading-[1.65] text-ink-2 md:pb-6">
              {panel.body}
            </div>
          </div>
        );
      })}
    </div>
  );
}
