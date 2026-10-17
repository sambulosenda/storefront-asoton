"use client";

/** A 48 × 28 on/off switch. */
export function Switch({
  checked,
  onChange,
  labelledBy,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelledBy?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 flex-none cursor-pointer rounded-full ${checked ? "bg-ink" : "bg-muted"}`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-[3px] size-[22px] rounded-full bg-paper transition-[left] ${checked ? "left-[23px]" : "left-[3px]"}`}
      />
    </button>
  );
}
