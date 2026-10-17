"use client";

import { CheckIcon, ChevronDown, CloseIcon } from "@/components/icons";
import { Sheet } from "@/components/sheet";
import { useStore } from "@/components/store-provider";
import type { Market } from "@/lib/shopify";
import { site } from "@/lib/site";

const label = (m: Market | null) => (m ? `${m.name} · ${m.currency.isoCode} ${m.currency.symbol}` : site.market);

export function MarketLabel() {
  return <>{label(useStore().market)}</>;
}

/** Country and currency. A plain label until the store sells to more than one country. */
export function MarketButton({ className = "" }: { className?: string }) {
  const { market, markets, open } = useStore();
  if (markets.length < 2) return <span className={`inline-flex items-center ${className}`}>{label(market)}</span>;
  return (
    <button
      type="button"
      onClick={() => open("market")}
      aria-label={`Country and currency: ${label(market)}. Change`}
      className={`inline-flex cursor-pointer items-center gap-1.5 ${className}`}
    >
      {label(market)}
      <ChevronDown />
    </button>
  );
}

export function MarketSheet() {
  const { overlay, close } = useStore();
  return (
    <Sheet
      open={overlay === "market"}
      onClose={close}
      placement="center"
      className="md:mt-[90px] md:mb-auto md:w-[520px]"
      aria-labelledby="market-title"
    >
      <MarketList onClose={close} />
    </Sheet>
  );
}

function MarketList({ onClose }: { onClose: () => void }) {
  const { markets, market, chooseCountry, switchingCountry } = useStore();
  return (
    <div className="flex max-h-dvh flex-col md:max-h-[calc(100dvh-180px)]">
      <div className="flex items-center justify-between gap-4 border-b border-line py-4 pr-2 pl-4 md:py-5 md:pr-6 md:pl-10">
        <h2 id="market-title" className="font-display text-[26px] leading-[1.2] md:text-[28px]">
          Country and currency
        </h2>
        <button type="button" aria-label="Close" onClick={onClose} className="inline-flex size-11 items-center justify-center">
          <CloseIcon />
        </button>
      </div>
      <p className="px-4 pt-5 text-[14px] leading-[1.6] text-ink-2 md:px-10">
        Prices, delivery and checkout follow the country you choose.
      </p>
      <ul aria-busy={switchingCountry} className="overflow-y-auto px-4 pt-3 pb-8 md:px-10">
        {markets.map((m) => {
          const current = m.isoCode === market?.isoCode;
          return (
            <li key={m.isoCode} className="border-b border-line">
              <button
                type="button"
                aria-current={current ? "true" : undefined}
                disabled={switchingCountry}
                onClick={() => {
                  if (!current) chooseCountry(m.isoCode);
                  onClose();
                }}
                className="flex min-h-[52px] w-full cursor-pointer items-center justify-between gap-4 text-left text-[15px] disabled:opacity-60"
              >
                <span className={current ? "font-medium" : ""}>{m.name}</span>
                <span className="flex items-center gap-3 text-ink-2">
                  {m.currency.isoCode} {m.currency.symbol}
                  {current && <CheckIcon size={18} className="text-ink" />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
