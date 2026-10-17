"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Garment } from "@/components/cloth";
import type { ClothKey, GarmentKey } from "@/lib/cloths";
import type { Image as ShopifyImage } from "@/lib/shopify/types";

/**
 * Desktop: a grid with the first photo full width, two half-width photos, then a wide
 * 3:2 photo. Phones: a swipeable carousel with a progress bar per photo.
 * Until there are photos, the garment drawing stands in.
 */
export function ProductGallery({
  images,
  title,
  drawing,
}: {
  images: ShopifyImage[];
  title: string;
  drawing: { garment: GarmentKey; cloth: ClothKey };
}) {
  const [index, setIndex] = useState(0);
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
              <Image
                src={image.url}
                alt={image.altText ?? `${title}, photo ${i + 1}`}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
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
              className={`relative bg-stone-2 ${full ? "col-span-full" : ""} ${i === 3 ? "aspect-[3/2]" : "aspect-[4/5]"}`}
            >
              <Image
                src={image.url}
                alt={image.altText ?? `${title}, photo ${i + 1}`}
                fill
                priority={i === 0}
                sizes={full ? "(min-width: 1440px) 760px, 55vw" : "(min-width: 1440px) 380px, 28vw"}
                className="object-cover"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
