"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { CloseIcon } from "@/components/icons";
import { Sheet } from "@/components/sheet";
import { type SizeGuideSizes, useStore } from "@/components/store-provider";
import { sizeCharts, toInches } from "@/lib/size-charts";

/**
 * A link to the size guide that opens it in place. Without JavaScript, in a new tab, or for a
 * search engine, it leads to the same charts on the help page.
 */
export function SizeGuideLink({ className, children }: { className?: string; children: ReactNode }) {
  const { openSizeGuide } = useStore();
  return (
    <Link
      href="/help#size-guide"
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        openSizeGuide();
      }}
    >
      {children}
    </Link>
  );
}

export function SizeGuide() {
  const { overlay, close, sizeGuideDept, sizeGuideSizes } = useStore();
  return (
    <Sheet open={overlay === "size-guide"} onClose={close} placement="center" className="md:mt-10 md:w-[880px] md:max-h-[min(820px,calc(100dvh-80px))]" aria-labelledby="sg-title">
      <SizeGuideBody key={`${sizeGuideDept}-${sizeGuideSizes.chosen ?? ""}`} initialDept={sizeGuideDept} sizes={sizeGuideSizes} onClose={close} />
    </Sheet>
  );
}

export function SizeGuideBody({
  initialDept,
  sizes = {},
  onClose,
}: {
  initialDept: "women" | "men";
  sizes?: SizeGuideSizes;
  onClose?: () => void;
}) {
  const [dept, setDept] = useState(initialDept);
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const chart = sizeCharts[dept];
  const value = (cm: number) => (unit === "cm" ? cm : toInches(cm));
  // From a product page: shade the size chosen, and grey out the sizes this piece doesn't come in
  // (only when the piece's sizes are on this chart, so a men's piece doesn't grey out the women's chart).
  const rowNames: string[] = chart.rows.map((r) => r[0]);
  const offered = sizes.offered?.filter((s) => rowNames.includes(s)) ?? [];

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-line py-4 pr-2 pl-4 md:py-5 md:pr-6 md:pl-10">
        <h2 id="sg-title" className="font-display text-[28px] leading-[1.1] md:text-[32px]">
          Size guide
        </h2>
        {onClose && (
          <button type="button" aria-label="Close size guide" onClick={onClose} className="inline-flex size-11 items-center justify-center">
            <CloseIcon />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-7 px-4 pt-6 pb-8 md:px-10 md:pt-7 md:pb-9">
        <div className="flex items-center justify-between gap-6 border-b border-line">
          <div role="tablist" aria-label="Department" className="flex gap-7">
            {(["women", "men"] as const).map((d) => (
              <button
                key={d}
                type="button"
                role="tab"
                aria-selected={dept === d}
                onClick={() => setDept(d)}
                className={`-mb-px h-12 cursor-pointer border-b text-[15px] capitalize ${
                  dept === d ? "border-ink font-medium" : "border-transparent"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Units" className="mb-2 flex border border-line">
            {(["cm", "in"] as const).map((u) => (
              <button
                key={u}
                type="button"
                aria-pressed={unit === u}
                onClick={() => setUnit(u)}
                className={`h-9 w-[52px] cursor-pointer text-[13px] ${unit === u ? "bg-ink text-paper" : ""}`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <p id="sg-note" className="mb-3 text-[13px] text-ink-2">
            Body measurements in {unit === "cm" ? "centimetres" : "inches"}.
            {sizes.chosen && rowNames.includes(sizes.chosen) && ` Your size, ${sizes.chosen}, is shaded.`}
            {offered.length > 0 && " Sizes this piece doesn’t come in are greyed out."}
          </p>
          <table aria-describedby="sg-note" className="w-full table-fixed border-collapse text-left text-[15px] tabular-nums">
            <thead>
              <tr className="label-caps border-b border-ink">
                <th scope="col" className="px-3 pb-2.5 font-semibold">
                  {chart.sizeHead}
                </th>
                <th scope="col" className="pb-2.5 font-semibold">
                  {chart.firstHead}
                </th>
                <th scope="col" className="pb-2.5 font-semibold">
                  Waist
                </th>
                <th scope="col" className="pb-2.5 font-semibold">
                  Hips
                </th>
              </tr>
            </thead>
            <tbody>
              {chart.rows.map(([size, a, b, c]) => (
                <tr
                  key={size}
                  className={`h-11 border-b border-line ${size === sizes.chosen ? "bg-stone" : ""} ${
                    offered.length > 0 && !offered.includes(size) ? "text-muted" : ""
                  }`}
                >
                  <th scope="row" className="px-3 font-medium">
                    {size}
                  </th>
                  <td>{value(a)}</td>
                  <td>{value(b)}</td>
                  <td>{value(c)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-10">
          <div className="flex flex-col gap-3.5">
            <h3 className="label-caps">How to measure</h3>
            <ol className="flex flex-col gap-3 text-[14px] leading-[1.55] text-ink-2">
              {[
                [chart.firstHead, "Around the fullest part, with the tape level under your arms."],
                ["Waist", "Around your natural waist, the narrowest part of your torso."],
                ["Hips", "Around the fullest part, with your feet together."],
              ].map(([term, text], i) => (
                <li key={term} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2">
                  <span className="font-semibold text-ink">{i + 1}</span>
                  <span>
                    <strong className="font-medium text-ink">{term}.</strong> {text}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col gap-3.5">
            <h3 className="label-caps">Fit by style</h3>
            <dl className="flex flex-col gap-3 text-[14px] leading-[1.55]">
              {chart.fits.map((f) => (
                <div key={f.style}>
                  <dt className="font-medium">{f.style}</dt>
                  <dd className="mt-0.5 text-ink-2">{f.note}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <p className="border-t border-line pt-5 text-[14px] text-ink-2">
          Between sizes?{" "}
          <Link href="/help#contact" onClick={onClose} className="underline-offset-4">
            Contact us
          </Link>{" "}
          and we’ll help you choose.
        </p>
      </div>
    </div>
  );
}
