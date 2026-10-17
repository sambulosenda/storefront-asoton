"use client";

import { useEffect, useRef, type ReactNode } from "react";

const PLACEMENT = {
  // Drawers slide in from the right; on phones they fill the screen.
  right: "m-0 ml-auto h-dvh w-full md:w-[480px] md:shadow-[-24px_0_48px_-24px_rgba(20,19,16,0.35)]",
  // Search drops down from the top edge.
  top: "m-0 mb-auto w-full border-b border-line",
  // Centred modals (size guide, cookie preferences); full screen on phones.
  center: "h-dvh w-full md:m-auto md:h-fit md:max-h-[calc(100dvh-80px)]",
  // Full-screen sheets on phones only (menu).
  full: "m-0 h-dvh w-full",
};

/** A modal dialog built on <dialog>: focus is trapped, Escape and the backdrop close it. */
export function Sheet({
  open,
  onClose,
  placement,
  className = "",
  children,
  ...aria
}: {
  open: boolean;
  onClose: () => void;
  placement: keyof typeof PLACEMENT;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      {...aria}
      // dialog.close() from the effect also fires "close"; forward only user dismissals (Escape).
      onClose={() => {
        if (open) onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`${PLACEMENT[placement]} ${className}`}
    >
      {open && children}
    </dialog>
  );
}
