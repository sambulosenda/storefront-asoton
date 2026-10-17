import Image from "next/image";
import { GARMENTS, clothOf, garmentFor, type ClothKey, type GarmentKey } from "@/lib/cloths";
import type { Image as ShopifyImage } from "@/lib/shopify/types";

/** SVG pattern fills for each cloth. Rendered once in the root layout; referenced as url(#pat-…). */
export function ClothPatterns() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" className="absolute size-0 overflow-hidden">
      <defs>
        <pattern id="pat-adire" width="80" height="80" patternUnits="userSpaceOnUse">
          <rect width="80" height="80" fill="#1E2A55" />
          <path d="M0 0.75H80M0.75 0V80" stroke="#C9D0E4" strokeWidth="1.5" fill="none" />
          <path d="M40 0V80M0 40H80" stroke="#C9D0E4" strokeWidth="0.75" fill="none" />
          <circle cx="20" cy="20" r="12" stroke="#C9D0E4" strokeWidth="1.5" fill="none" />
          <circle cx="20" cy="20" r="6" stroke="#C9D0E4" strokeWidth="1.5" fill="none" />
          <circle cx="20" cy="20" r="1.75" fill="#C9D0E4" />
          <path d="M47 11H73M47 17H73M47 23H73M47 29H73" stroke="#C9D0E4" strokeWidth="1.5" fill="none" />
          <g fill="#C9D0E4">
            {[50, 60, 70].flatMap((cy) =>
              [10, 20, 30].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" />),
            )}
          </g>
          <path d="M60 47L73 60L60 73L47 60Z" stroke="#C9D0E4" strokeWidth="1.5" fill="none" />
          <circle cx="60" cy="60" r="2.5" fill="#C9D0E4" />
        </pattern>
        <pattern id="pat-kente" width="120" height="120" patternUnits="userSpaceOnUse">
          <rect width="120" height="120" fill="#C8A03A" />
          <rect x="0" y="0" width="60" height="16" fill="#161412" />
          <rect x="0" y="22" width="60" height="4" fill="#2F5A3C" />
          <rect x="0" y="30" width="60" height="4" fill="#2F5A3C" />
          <rect x="0" y="60" width="60" height="16" fill="#161412" />
          <rect x="0" y="82" width="60" height="4" fill="#8C2F23" />
          <rect x="0" y="90" width="60" height="4" fill="#8C2F23" />
          <rect x="60" y="0" width="60" height="120" fill="#2F5A3C" />
          <rect x="66" y="8" width="48" height="44" fill="#C8A03A" />
          <rect x="78" y="18" width="24" height="24" fill="#161412" />
          <rect x="60" y="60" width="60" height="6" fill="#161412" />
          <rect x="60" y="72" width="60" height="6" fill="#C8A03A" />
          <rect x="60" y="84" width="60" height="6" fill="#8C2F23" />
          <rect x="60" y="96" width="60" height="6" fill="#C8A03A" />
          <rect x="60" y="108" width="60" height="6" fill="#161412" />
          <rect x="59" y="0" width="2" height="120" fill="#161412" opacity="0.5" />
        </pattern>
        <pattern id="pat-bogolan" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="#2E2219" />
          <g stroke="#E3D6BF" strokeWidth="2" fill="none">
            <path d="M0 3H100M0 9H100" />
            <path d="M0 78L10 68L20 78L30 68L40 78L50 68L60 78L70 68L80 78L90 68L100 78" />
            <circle cx="25" cy="44" r="9" />
            <circle cx="75" cy="44" r="9" />
            <path d="M44 34L56 54M56 34L44 54" />
          </g>
          <g fill="#E3D6BF">
            {[5, 15, 25, 35, 45, 55, 65, 75, 85, 95].map((cx) => (
              <circle key={cx} cx={cx} cy="21" r="1.8" />
            ))}
            <circle cx="25" cy="44" r="2.5" />
            <circle cx="75" cy="44" r="2.5" />
            {[10, 30, 50, 70, 90].map((cx) => (
              <circle key={cx} cx={cx} cy="90" r="1.8" />
            ))}
          </g>
        </pattern>
        <pattern id="pat-asooke" width="36" height="12" patternUnits="userSpaceOnUse">
          <rect width="36" height="12" fill="#DCCFB3" />
          <rect x="0" y="0" width="2" height="12" fill="#2B2620" />
          <rect x="6" y="0" width="9" height="12" fill="#B68B3A" />
          <rect x="18" y="0" width="1" height="12" fill="#2B2620" />
          <rect x="23" y="0" width="4" height="12" fill="#6E2A35" />
          <rect x="30" y="0" width="1" height="12" fill="#2B2620" />
          <rect x="0" y="0" width="36" height="1" fill="#2B2620" opacity="0.08" />
          <rect x="0" y="6" width="36" height="1" fill="#FFFFFF" opacity="0.18" />
        </pattern>
        <pattern id="pat-wax" width="120" height="120" patternUnits="userSpaceOnUse">
          <rect width="120" height="120" fill="#A9472B" />
          <circle cx="60" cy="60" r="46" fill="#DDAE3E" />
          <circle cx="60" cy="60" r="34" fill="#1F2A4F" />
          <circle cx="60" cy="60" r="22" fill="#F0E4CC" />
          <circle cx="60" cy="60" r="10" fill="#A9472B" />
          <g fill="#1F2A4F">
            <circle cx="0" cy="0" r="16" />
            <circle cx="120" cy="0" r="16" />
            <circle cx="0" cy="120" r="16" />
            <circle cx="120" cy="120" r="16" />
          </g>
          <g fill="#F0E4CC">
            <circle cx="0" cy="0" r="6" />
            <circle cx="120" cy="0" r="6" />
            <circle cx="0" cy="120" r="6" />
            <circle cx="120" cy="120" r="6" />
          </g>
        </pattern>
      </defs>
    </svg>
  );
}

/** A garment outline filled with a cloth pattern, in a 3:4 box. */
export function Garment({
  garment,
  cloth,
  strokeWidth = 1.25,
  className,
}: {
  garment: GarmentKey;
  cloth: ClothKey;
  strokeWidth?: number;
  className?: string;
}) {
  const g: { s: string; d: string; b?: string } = GARMENTS[garment];
  return (
    <svg width="100%" height="100%" viewBox="0 0 240 320" aria-hidden="true" className={className}>
      {g.b && <path d={g.b} fill="#CFC8BD" />}
      <path
        d={g.s}
        fill={`url(#pat-${cloth})`}
        stroke="#141310"
        strokeOpacity="0.55"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path d={g.d} fill="none" stroke="#141310" strokeOpacity="0.55" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

/** A flat swatch of cloth that fills its box. */
export function ClothSwatch({ cloth, className }: { cloth: ClothKey; className?: string }) {
  return (
    <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 300" aria-hidden="true" className={className}>
      <rect width="400" height="300" fill={`url(#pat-${cloth})`} />
    </svg>
  );
}

type Describable = { title: string; productType?: string; tags?: string[] };

/** The garment drawing that stands in for a product photo. */
export function drawingFor(product: Describable) {
  const text = [product.title, product.productType, ...(product.tags ?? [])].join(" ");
  return { garment: garmentFor(text), cloth: clothOf(product)?.key ?? "adire" };
}

/**
 * The product's photo on the stone ground; or, until there is one, its garment drawing.
 * The parent sets the size and aspect ratio.
 */
export function ProductVisual({
  product,
  image,
  sizes,
  priority,
  drawingWidth = "76%",
}: {
  product: Describable;
  image: ShopifyImage | null;
  sizes: string;
  priority?: boolean;
  drawingWidth?: string;
}) {
  if (image) {
    return (
      <Image
        src={image.url}
        alt={image.altText ?? product.title}
        fill
        sizes={sizes}
        loading={priority ? "eager" : undefined}
        className="object-cover"
      />
    );
  }
  const { garment, cloth } = drawingFor(product);
  return (
    <div className="aspect-[3/4]" style={{ width: drawingWidth }}>
      <Garment garment={garment} cloth={cloth} />
    </div>
  );
}
