"use client";

import { useId, useState } from "react";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { Sheet } from "@/components/sheet";
import { Switch } from "@/components/switch";
import { chipLabel, filterKind, isPriceInput, priceInput, readPrice, swatchColour } from "@/lib/filters";
import type { Filter } from "@/lib/shopify/types";

export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${label}`}
      className="inline-flex h-9 cursor-pointer items-center gap-2 bg-ink pr-2.5 pl-3.5 text-[13px] text-paper"
    >
      {label}
      <CloseIcon size={14} />
    </button>
  );
}

export function FilterDrawer({
  open,
  onClose,
  filters,
  selected,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  filters: Filter[];
  selected: string[];
  onApply: (selected: string[]) => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} placement="right" aria-labelledby="filter-title">
      <FilterPanel filters={filters} initial={selected} onClose={onClose} onApply={onApply} />
    </Sheet>
  );
}

function FilterPanel({
  filters,
  initial,
  onClose,
  onApply,
}: {
  filters: Filter[];
  initial: string[];
  onClose: () => void;
  onApply: (selected: string[]) => void;
}) {
  const [selected, setSelected] = useState(initial.filter((i) => !isPriceInput(i)));
  const [price, setPrice] = useState(readPrice(initial));
  // Phones show each group as a collapsible section; the first opens by default.
  const [openGroups, setOpenGroups] = useState<string[]>(filters[0] ? [filters[0].id] : []);
  const id = useId();

  const toggle = (input: string) =>
    setSelected((s) => (s.includes(input) ? s.filter((x) => x !== input) : [...s, input]));
  const toggleGroup = (groupId: string) =>
    setOpenGroups((g) => (g.includes(groupId) ? g.filter((x) => x !== groupId) : [...g, groupId]));

  const current = () => {
    const p = priceInput(price.min, price.max);
    return p ? [...selected, p] : selected;
  };
  const chips = current().flatMap((input) => {
    const label = chipLabel(input, filters);
    return label ? [{ input, label }] : [];
  });

  const removeChip = (input: string) => {
    if (isPriceInput(input)) setPrice({ min: "", max: "" });
    else toggle(input);
  };

  const groups = filters.filter((f) => filterKind(f) !== "availability");
  const availability = filters.find((f) => filterKind(f) === "availability");
  const inStockValue = availability?.values.find((v) => v.input.includes('"available":true'));

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[60px] flex-none items-center justify-between gap-4 border-b border-line pr-2 pl-4 md:h-auto md:py-[18px] md:pr-5 md:pl-8">
        <h2 id="filter-title" className="font-display text-[24px] leading-[1.2] md:text-[28px]">
          Filter
        </h2>
        <button type="button" aria-label="Close filters" onClick={onClose} className="inline-flex size-11 items-center justify-center">
          <CloseIcon />
        </button>
      </div>

      {chips.length > 0 && (
        <div aria-label="Selected filters" className="hidden flex-none flex-wrap gap-2 border-b border-line px-8 py-4 md:flex">
          {chips.map((chip) => (
            <FilterChip key={chip.input} label={chip.label} onRemove={() => removeChip(chip.input)} />
          ))}
        </div>
      )}

      <div className="min-h-0 flex-auto overflow-y-auto px-4 md:px-8">
        {groups.length === 0 && !inStockValue && (
          <p className="py-8 text-[15px] text-ink-2">There are no filters for this collection yet.</p>
        )}
        {groups.map((filter) => {
          const kind = filterKind(filter);
          const isOpen = openGroups.includes(filter.id);
          const count =
            kind === "price"
              ? Number(Boolean(priceInput(price.min, price.max)))
              : filter.values.filter((v) => selected.includes(v.input)).length;
          const legend = kind === "size" ? `${filter.label} (UK)` : filter.label;

          return (
            <fieldset key={filter.id} className="min-w-0 border-b border-line md:py-6">
              <legend className="label-caps float-left hidden w-full pb-3 md:block">{legend}</legend>
              <h3 className="md:hidden">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleGroup(filter.id)}
                  className="flex min-h-14 w-full cursor-pointer items-center justify-between text-[15px] font-medium"
                >
                  <span>
                    {legend} {count > 0 && <span className="font-normal text-ink-2">· {count}</span>}
                  </span>
                  {isOpen ? <MinusIcon size={18} /> : <PlusIcon size={18} />}
                </button>
              </h3>
              <div className={`clear-both pb-3 md:block md:pb-0 ${isOpen ? "block" : "hidden"}`}>
                {kind === "list" && (
                  <div className="flex flex-col">
                    {filter.values.map((v) => (
                      <label key={v.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
                        <input
                          type="checkbox"
                          checked={selected.includes(v.input)}
                          onChange={() => toggle(v.input)}
                          className="size-5 accent-ink md:size-[18px]"
                        />
                        <span className="flex-1">{v.label}</span>
                        <span className="text-[13px] text-ink-2">{v.count}</span>
                      </label>
                    ))}
                  </div>
                )}
                {kind === "colour" && (
                  <div className="grid grid-cols-2 gap-x-3 md:gap-x-4 md:gap-y-1">
                    {filter.values.map((v) => {
                      const on = selected.includes(v.input);
                      return (
                        <button
                          key={v.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggle(v.input)}
                          className="flex min-h-11 cursor-pointer items-center gap-3 text-left text-[15px]"
                        >
                          <span className={`inline-flex size-7 flex-none items-center justify-center rounded-full border ${on ? "border-ink" : "border-transparent"}`}>
                            <span
                              className="size-5 rounded-full shadow-[inset_0_0_0_1px_rgba(20,19,16,0.12)]"
                              style={{ backgroundColor: swatchColour(v.label, v.swatch?.color) }}
                            />
                          </span>
                          <span className={on ? "font-medium" : ""}>{v.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {kind === "size" && (
                  <div className="grid grid-cols-4 gap-2 pb-1">
                    {filter.values.map((v) => {
                      const on = selected.includes(v.input);
                      const disabled = v.count === 0 && !on;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          aria-pressed={on}
                          disabled={disabled}
                          onClick={() => toggle(v.input)}
                          className={`h-12 cursor-pointer border text-[14px] md:h-11 ${
                            on ? "border-ink bg-ink text-paper" : disabled ? "border-line-soft text-muted line-through" : "border-line"
                          }`}
                        >
                          {v.label}
                        </button>
                      );
                    })}
                  </div>
                )}
                {kind === "price" && (
                  <div className="grid grid-cols-2 gap-4 pb-1">
                    {(["min", "max"] as const).map((end) => (
                      <div key={end} className="flex flex-col gap-1.5">
                        <label htmlFor={`${id}-${end}`} className="text-[13px] text-ink-2 capitalize">
                          {end}
                        </label>
                        <div className="flex h-12 items-center gap-1.5 border border-line px-3.5">
                          <span aria-hidden="true" className="text-ink-2">
                            £
                          </span>
                          <input
                            id={`${id}-${end}`}
                            type="number"
                            inputMode="numeric"
                            min={0}
                            placeholder={end === "min" ? "0" : ""}
                            value={price[end]}
                            onChange={(e) => setPrice({ ...price, [end]: e.target.value })}
                            className="min-w-0 flex-1 bg-transparent text-[15px] focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </fieldset>
          );
        })}

        {inStockValue && (
          <div className="flex min-h-16 items-center justify-between gap-4 border-b border-line md:border-b-0 md:pt-5 md:pb-7">
            <span id={`${id}-stock`} className="text-[15px] font-medium md:font-normal">
              In stock only
            </span>
            <Switch checked={selected.includes(inStockValue.input)} labelledBy={`${id}-stock`} onChange={() => toggle(inStockValue.input)} />
          </div>
        )}
      </div>

      <div className="grid flex-none grid-cols-[1fr_2fr] gap-2 border-t border-line px-4 pt-3 pb-7 md:grid-cols-2 md:gap-3 md:px-8 md:pt-5">
        <button
          type="button"
          onClick={() => {
            setSelected([]);
            setPrice({ min: "", max: "" });
          }}
          className="btn btn-outline h-[52px] px-0 md:h-14"
        >
          <span className="md:hidden">Clear</span>
          <span className="hidden md:inline">Clear all</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onApply(current());
            onClose();
          }}
          className="btn btn-ink h-[52px] px-0 md:h-14"
        >
          Show results
        </button>
      </div>
    </div>
  );
}
