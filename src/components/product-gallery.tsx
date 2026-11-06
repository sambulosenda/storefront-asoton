"use client";

import Image from "next/image";
import { useEffect, useRef, useState, ViewTransition, type ReactNode } from "react";
import { Garment } from "@/components/cloth";
import { CloseIcon } from "@/components/icons";
import { Sheet } from "@/components/sheet";
import type { ClothKey, GarmentKey } from "@/lib/cloths";
import type { Image as ShopifyImage } from "@/lib/shopify/types";

/**
 * Desktop: a grid with the first photo full width, two half-width photos, then a wide
 * 3:2 photo. Phones: a swipeable carousel with a progress bar per photo.
 * Until there are photos, the garment drawing stands in. Any photo opens full screen.
 */
export function ProductGallery({
  images,
  title,
  handle,
  drawing,
}: {
  images: ShopifyImage[];
  title: string;
  /** Names the first photo, so a product card's photo can move into it. */
  handle: string;
  drawing: { garment: GarmentKey; cloth: ClothKey };
}) {
  const [index, setIndex] = useState(0);
  const [viewing, setViewing] = useState<number | null>(null);
  const rail = useRef<HTMLDivElement>(null);
  const slides = images.slice(0, 8);

  const placeholder = (
    <div className="flex h-full w-full items-center justify-center bg-stone">
      <div className="aspect-[3/4] w-[64%]">
        <Garment garment={drawing.garment} cloth={drawing.cloth} />
      </div>
    </div>
  );

  return (
    <div aria-label="Product images" role="group" className="min-w-0 md:flex-[7_1_560px]">
      {/* Phones */}
      <div className="relative h-[488px] md:hidden">
        <div
          ref={rail}
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto"
        >
          {slides.length === 0 && <div className="h-full w-full flex-none">{placeholder}</div>}
          {slides.map((image, i) => (
            <div key={image.url} className="relative h-full w-full flex-none snap-start bg-stone-2">
              <Shared handle={handle} first={false}>
                <ZoomButton label={`Open photo ${i + 1} of ${slides.length} full screen`} onClick={() => setViewing(i)}>
                  <Image
                    src={image.url}
                    alt={image.altText ?? `${title}, photo ${i + 1}`}
                    fill
                    loading={i === 0 ? "eager" : undefined}
                    fetchPriority={i === 0 ? "high" : undefined}
                    sizes="100vw"
                    className="object-cover"
                  />
                </ZoomButton>
              </Shared>
            </div>
          ))}
        </div>
        {slides.length > 1 && (
          <div aria-hidden="true" className="absolute inset-x-4 bottom-4 flex gap-1">
            {slides.map((image, i) => (
              <span key={image.url} className={`h-0.5 flex-1 ${i === index ? "bg-ink" : "bg-ink/20"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Tablet and desktop */}
      <div className="hidden grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-3 md:grid">
        {slides.length === 0 && <div className="col-span-full aspect-[4/5]">{placeholder}</div>}
        {slides.map((image, i) => {
          // After the opening rows (0 full, 1–2 paired, 3 full) photos pair up, so a last photo alone in its row goes full width.
          const orphan = i === slides.length - 1 && (i === 1 || (i > 3 && i % 2 === 0));
          const full = i === 0 || i === 3 || orphan;
          return (
            <div
              key={image.url}
              className={`relative overflow-hidden bg-stone-2 ${i > 0 ? "reveal" : ""} ${full ? "col-span-full" : ""} ${i === 3 ? "aspect-[3/2]" : "aspect-[4/5]"}`}
            >
              <Shared handle={handle} first={i === 0}>
                <ZoomButton label={`Open photo ${i + 1} of ${slides.length} full screen`} onClick={() => setViewing(i)}>
                  <Image
                    src={image.url}
                    alt={image.altText ?? `${title}, photo ${i + 1}`}
                    fill
                    loading={i === 0 ? "eager" : undefined}
                    fetchPriority={i === 0 ? "high" : undefined}
                    sizes={full ? "(min-width: 1440px) 760px, 55vw" : "(min-width: 1440px) 380px, 28vw"}
                    className="object-cover transition-transform duration-(--duration-slow) ease-(--ease-out-soft) group-hover/zoom:scale-[1.02]"
                  />
                </ZoomButton>
              </Shared>
            </div>
          );
        })}
      </div>

      <Sheet open={viewing !== null} onClose={() => setViewing(null)} placement="full" aria-label={`${title}, photos`}>
        {viewing !== null && <Viewer images={slides} title={title} start={viewing} onClose={() => setViewing(null)} />}
      </Sheet>
    </div>
  );
}

/** The first desktop photo carries the product's name, so the card's photo can move into it. Only one copy may carry it. */
function Shared({ handle, first, children }: { handle: string; first: boolean; children: ReactNode }) {
  if (!first) return children;
  return (
    <ViewTransition name={`product-${handle}`} share="morph" default="none">
      <div className="absolute inset-0">{children}</div>
    </ViewTransition>
  );
}

function ZoomButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="group/zoom absolute inset-0 block cursor-zoom-in">
      {children}
    </button>
  );
}

/**
 * Every photo, full size, one under another, starting at the one that was opened.
 * On a computer, clicking a photo magnifies it twice over, following the pointer.
 */
function Viewer({ images, title, start, onClose }: { images: ShopifyImage[]; title: string; start: number; onClose: () => void }) {
  const list = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState<number | null>(null);
  const [origin, setOrigin] = useState("50% 50%");

  useEffect(() => {
    list.current?.children[start]?.scrollIntoView({ block: "start" });
  }, [start]);

  const follow = (e: React.MouseEvent<HTMLElement>) => {
    // A click from the keyboard has no pointer position: zoom on the middle.
    if (e.detail === 0) return setOrigin("50% 50%");
    const box = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - box.left) / box.width) * 100}% ${((e.clientY - box.top) / box.height) * 100}%`);
  };

  return (
    <div className="relative h-full overflow-y-auto bg-paper">
      <button
        type="button"
        aria-label="Close photos"
        onClick={onClose}
        className="fixed top-3 right-3 z-10 inline-flex size-12 cursor-pointer items-center justify-center bg-paper/90 md:top-6 md:right-6"
      >
        <CloseIcon />
      </button>
      <div ref={list} className="mx-auto flex max-w-[1200px] flex-col gap-2 md:gap-4 md:py-6">
        {images.map((image, i) => (
          <div key={image.url} className="overflow-hidden bg-stone-2">
            <button
              type="button"
              aria-label={`Zoom in on photo ${i + 1}`}
              aria-pressed={zoomed === i}
              onClick={(e) => {
                follow(e);
                setZoomed(zoomed === i ? null : i);
              }}
              onMouseMove={zoomed === i ? follow : undefined}
              className={`block w-full ${zoomed === i ? "cursor-zoom-out" : "cursor-zoom-in"}`}
            >
              <Image
                src={image.url}
                alt={image.altText ?? `${title}, photo ${i + 1}`}
                width={image.width}
                height={image.height}
                sizes="(min-width: 1200px) 1200px, 100vw"
                className="h-auto w-full transition-transform duration-(--duration-medium) ease-(--ease-out-soft)"
                style={{ transform: zoomed === i ? "scale(2)" : undefined, transformOrigin: origin }}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
