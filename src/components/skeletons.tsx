const WIDTHS = [
  ["70%", "35%"],
  ["60%", "30%"],
  ["75%", "40%"],
  ["55%", "30%"],
];

/** Placeholder cards while a product grid loads. */
export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] md:gap-x-6 md:gap-y-12">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-2.5 md:gap-3.5">
          <div className="aspect-[3/4] bg-stone" />
          <div className="h-3.5 bg-skeleton" style={{ width: WIDTHS[i % 4][0] }} />
          <div className="h-3 bg-skeleton" style={{ width: WIDTHS[i % 4][1] }} />
        </div>
      ))}
    </div>
  );
}

export function CollectionSkeleton() {
  return (
    <div className="page-x pt-4 pb-24 md:pt-8">
      <span className="sr-only">Loading</span>
      <div aria-hidden="true" className="flex flex-col gap-4 pt-1 pb-8 md:pt-12 md:pb-10">
        <div className="h-3 w-24 bg-skeleton" />
        <div className="h-14 w-1/2 max-w-[420px] bg-skeleton md:h-24" />
      </div>
      <div aria-hidden="true" className="mb-10 h-[54px] border-y border-line" />
      <GridSkeleton />
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="page-x flex flex-wrap gap-16 pt-8 pb-24">
      <span className="sr-only">Loading</span>
      <div aria-hidden="true" className="aspect-[4/5] min-w-0 flex-[7_1_560px] bg-stone" />
      <div aria-hidden="true" className="flex min-w-0 flex-[5_1_380px] flex-col gap-4 pt-8">
        <div className="h-3 w-[30%] bg-skeleton" />
        <div className="h-9 w-[75%] bg-skeleton" />
        <div className="h-[18px] w-[20%] bg-skeleton" />
        <div className="grid grid-cols-7 gap-2 pt-4">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="h-12 bg-stone" />
          ))}
        </div>
        <div className="h-14 bg-skeleton" />
      </div>
    </div>
  );
}
