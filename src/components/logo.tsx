import { site } from "@/lib/site";

/**
 * The JT Aphrique mark from the shop's current site (africanclothingstore.co.uk), redrawn as SVG
 * so it stays sharp at any size and sits on any background. The only copy online is a 239×51 JPG.
 * Black parts use currentColor, so it reads on the dark footer too. Widths are fixed with textLength,
 * so the mark keeps its shape whichever font has loaded.
 */
// Low optical size keeps the hairlines sturdy, as in the original mark.
const serif = { fontFamily: "var(--font-display, 'Bodoni 72', Didot, Georgia, serif)", fontVariationSettings: '"opsz" 11' };
const sans = { fontFamily: "var(--font-sans, 'Helvetica Neue', Helvetica, Arial, sans-serif)" };

export function Logo({ className, tagline = true, dark = false }: { className?: string; tagline?: boolean; dark?: boolean }) {
  const red = "#e30613";
  const green = dark ? "#3fa356" : "#0b6623";
  return (
    <svg
      viewBox={tagline ? "0 0 240 51" : "0 0 240 34"}
      role="img"
      aria-label={site.brand}
      className={className}
      fill="currentColor"
    >
      <text
        x="5"
        y={tagline ? 48 : 31}
        fill={red}
        style={serif}
        fontWeight="700"
        fontSize={tagline ? 60 : 40}
        textLength="16"
        lengthAdjust="spacingAndGlyphs"
      >
        J
      </text>
      <text
        x="23"
        y="31"
        fill={green}
        style={serif}
        fontWeight="700"
        fontSize="40"
        textLength="24"
        lengthAdjust="spacingAndGlyphs"
      >
        T
      </text>
      <text
        x="58"
        y="31"
        style={serif}
        fontWeight="700"
        fontSize="40"
        textLength="178"
        lengthAdjust="spacingAndGlyphs"
      >
        APHRIQUE
      </text>
      {tagline && (
        <text
          x="32"
          y="48"
          style={sans}
          fontWeight="600"
          fontSize="11"
          textLength="204"
          lengthAdjust="spacingAndGlyphs"
        >
          PRIDE &amp; BEAUTY OF AFRICAN FASHION
        </text>
      )}
    </svg>
  );
}
