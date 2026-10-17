// The five cloths the shop is built around, and the garment drawings that stand in
// for product photography until it is shot. Copy comes from the AsoTone design.

export type ClothKey = "adire" | "kente" | "bogolan" | "asooke" | "wax";

export type Cloth = {
  key: ClothKey;
  name: string;
  technique: string;
  origin: string;
  /** Short origin for tight spaces, e.g. "Nigeria". */
  country: string;
  shop: string;
  garment: GarmentKey;
  piece: string;
  caption: string;
  about?: string;
  /** The shorter caption under the phone-sized preview on the home page. */
  shown?: string;
  styles?: { name: string; note: string }[];
  care: string;
};

export const CLOTHS: Cloth[] = [
  {
    key: "adire",
    name: "Adire",
    technique: "Indigo resist-dye",
    origin: "Yorùbá · Nigeria",
    country: "Nigeria",
    shop: "Shop adire",
    garment: "dress",
    piece: "Adire Wrap Dress",
    caption:
      "Adire eleko: cassava-starch paste is painted or stencilled onto cotton, then the cloth goes into the indigo. Where the paste sat, the pattern stays pale.",
    shown:
      "Shown: the Adire Wrap Dress. Adire eleko is made by painting cassava-starch paste onto cotton before the cloth goes into the indigo.",
    about:
      "Adire means “tied and dyed” in Yorùbá. The pattern comes from stopping indigo reaching parts of the cloth, and the way it is stopped gives each style its name. Abeokuta, in south-west Nigeria, remains one of its best-known centres.",
    styles: [
      { name: "Oniko", note: "Tied with raffia before dyeing, for circles and sunbursts." },
      { name: "Alabere", note: "Stitched and gathered before dyeing, for fine lines." },
      { name: "Eleko", note: "Cassava-starch paste painted or stencilled on, for detailed motifs." },
    ],
    care: "Hand wash cold, on its own, with a mild detergent. Dry in the shade. Natural indigo can mark pale fabrics for the first few washes.",
  },
  {
    key: "kente",
    name: "Kente",
    technique: "Strip-woven silk and cotton",
    origin: "Asante and Ewe · Ghana",
    country: "Ghana",
    shop: "Shop kente",
    garment: "skirt",
    piece: "Kente Panel Midi Skirt",
    caption:
      "Kente is woven on narrow looms in strips a few inches wide, then sewn edge to edge. Each pattern has its own name.",
    care: "Dry clean. Store folded in a breathable bag, out of direct sunlight, so the woven strips keep their shape.",
  },
  {
    key: "bogolan",
    name: "Bògòlanfini",
    technique: "Mud-dyed cotton",
    origin: "Bamana · Mali",
    country: "Mali",
    shop: "Shop bògòlan",
    garment: "overshirt",
    piece: "Bògòlan Overshirt",
    caption:
      "Cotton is dyed in a leaf bath, then painted by hand with fermented river mud. The dark ground is the mud; the motifs are the cloth left unpainted.",
    care: "Dry clean, or a brief cold hand wash without bleach or strong detergent, which can fade the mud dye.",
  },
  {
    key: "asooke",
    name: "Aso-oke",
    technique: "Hand-loomed strip cloth",
    origin: "Yorùbá · Nigeria",
    country: "Nigeria",
    shop: "Shop aso-oke",
    garment: "agbada",
    piece: "Aso-oke Agbada Set",
    caption:
      "Aso-oke is hand-loomed in narrow strips by Yorùbá weavers and kept for the big days: weddings, naming ceremonies, celebrations.",
    care: "Dry clean. Store folded in a breathable bag, out of direct sunlight, so the woven strips keep their shape.",
  },
  {
    key: "wax",
    name: "Wax print",
    technique: "Resin-resist printed cotton",
    origin: "West and Central Africa",
    country: "West and Central Africa",
    shop: "Shop wax print",
    garment: "twopiece",
    piece: "Wax-print Two-piece Set",
    caption:
      "A resin resist is printed onto cotton before dyeing, which gives wax print its fine crackle. Many patterns carry names and sayings.",
    care: "Wash cold on a gentle cycle, inside out, with similar colours. Iron on the reverse while slightly damp.",
  },
];

const CLOTH_WORDS: [ClothKey, RegExp][] = [
  ["adire", /adire|indigo/i],
  ["kente", /kente/i],
  ["bogolan", /b[oò]g[oò]lan|mud ?cloth/i],
  ["asooke", /aso[- ]?oke|agbada/i],
  ["wax", /wax|ankara/i],
];

/** Guess the cloth from a product's title, type and tags. */
export function clothFor(text: string): Cloth | null {
  const hit = CLOTH_WORDS.find(([, re]) => re.test(text));
  return hit ? CLOTHS.find((c) => c.key === hit[0])! : null;
}

export function clothByName(name: string | null | undefined): Cloth | null {
  if (!name) return null;
  return clothFor(name);
}

export type GarmentKey = keyof typeof GARMENTS;

/** Outlines in a 240×320 box: `b` is an optional base layer (a head form), `s` the cloth, `d` seams. */
export const GARMENTS = {
  dress: {
    s: "M106 38 Q120 52 134 38 L154 46 L192 116 L178 126 L150 98 L144 134 Q170 210 184 300 Q120 312 56 300 Q70 210 96 134 L90 98 L62 126 L48 116 L86 46 Z",
    d: "M107 40 L140 133 M133 40 L118 80 M96 134 L144 134 M142 136 L160 176 M142 136 L150 180",
  },
  kaftan: {
    s: "M104 40 Q120 54 136 40 L196 58 L214 134 L174 140 L168 118 L170 300 L70 300 L72 118 L66 140 L26 134 L44 58 Z",
    d: "M108 44 Q120 66 132 44 M120 54 L120 118 M168 266 L168 300 M72 266 L72 300",
  },
  boubou: {
    s: "M104 40 Q120 56 136 40 L226 96 L222 150 Q196 160 172 150 L178 300 L62 300 L68 150 Q44 160 18 150 L14 96 Z",
    d: "M100 44 Q120 80 140 44",
  },
  twopiece: {
    s: "M104 44 Q120 56 136 44 L156 48 Q182 52 186 76 Q182 96 164 92 L162 128 L78 128 L76 92 Q58 96 54 76 Q58 52 84 48 Z M84 148 L156 148 L178 300 L62 300 Z",
    d: "M76 92 Q70 76 84 50 M164 92 Q170 76 156 50 M84 160 L156 160 M150 162 Q140 232 128 300",
  },
  shirtdress: {
    s: "M100 42 L112 34 L120 46 L128 34 L140 42 L172 56 L198 98 L176 112 L166 96 L170 300 L70 300 L74 96 L64 112 L42 98 L68 56 Z",
    d: "M120 46 L120 150 M112 34 L106 62 L120 46 L134 62 L128 34 M74 150 L166 150 M116 84 L124 84 M116 120 L124 120",
  },
  top: {
    s: "M104 100 Q120 112 136 100 L156 104 Q190 106 192 136 Q188 162 164 156 L166 246 L74 246 L76 156 Q52 162 48 136 Q50 106 84 104 Z",
    d: "M76 156 Q70 130 84 106 M164 156 Q170 130 156 106",
  },
  maxi: {
    s: "M100 40 Q120 54 140 40 L152 44 L150 110 Q176 200 190 300 Q120 312 50 300 Q64 200 90 110 L88 44 Z",
    d: "M90 110 L150 110 M72 196 Q120 204 168 196 M58 252 Q120 262 182 252",
  },
  skirt: {
    s: "M86 48 L154 48 L182 300 L58 300 Z",
    d: "M86 64 L154 64 M148 66 Q138 186 126 300",
  },
  trousers: {
    s: "M78 44 L162 44 L178 300 L128 300 L120 132 L112 300 L62 300 Z",
    d: "M78 60 L162 60 M114 60 Q110 82 104 92 M126 60 Q130 82 136 92",
  },
  headwrap: {
    b: "M92 300 L94 256 Q72 242 72 202 Q72 162 120 158 Q168 162 168 202 Q168 242 146 256 L148 300 Z",
    s: "M56 204 Q44 140 82 108 Q120 80 158 108 Q196 140 184 204 Q152 184 120 186 Q88 184 56 204 Z M108 98 Q104 78 120 72 Q136 78 132 98 Q120 94 108 98 Z",
    d: "M64 184 Q104 132 170 124 M72 198 Q122 156 178 160 M60 160 Q90 118 140 104",
  },
  overshirt: {
    s: "M100 42 L112 34 L120 46 L128 34 L140 42 L176 54 L206 236 L184 242 L164 120 L166 280 L74 280 L76 120 L56 242 L34 236 L64 54 Z",
    d: "M120 46 L120 280 M112 34 L106 62 L120 46 L134 62 L128 34 M86 102 L110 102 L110 128 L86 128 Z M130 102 L154 102 L154 128 L130 128 Z",
  },
  agbada: {
    s: "M106 40 Q120 52 134 40 L222 70 L224 240 Q200 250 178 238 L172 300 L68 300 L62 238 Q40 250 16 240 L18 70 Z",
    d: "M106 42 Q120 58 134 42 L138 132 Q120 142 102 132 Z M144 156 L170 156 L170 186 L144 186 Z",
  },
  tunic: {
    s: "M104 60 Q120 74 136 60 L196 78 L214 154 L174 160 L168 138 L170 270 L70 270 L72 138 L66 160 L26 154 L44 78 Z",
    d: "M108 64 Q120 86 132 64 M120 74 L120 138",
  },
  shirt: {
    s: "M100 42 L112 34 L120 46 L128 34 L140 42 L172 56 L198 98 L176 112 L166 96 L168 290 L72 290 L74 96 L64 112 L42 98 L68 56 Z",
    d: "M120 46 L120 290 M112 34 L106 62 L120 46 L134 62 L128 34 M116 84 L124 84 M116 124 L124 124 M116 164 L124 164 M116 204 L124 204 M116 244 L124 244",
  },
  stole: {
    s: "M92 40 L148 40 L152 296 L126 296 L122 120 L118 296 L88 296 Z",
    d: "M92 40 Q120 56 148 40 M92 296 L92 310 M98 296 L98 310 M104 296 L104 310 M110 296 L110 310 M116 296 L116 310 M128 296 L128 310 M134 296 L134 310 M140 296 L140 310 M146 296 L146 310 M150 296 L150 310",
  },
  cap: {
    s: "M60 210 Q60 128 120 124 Q180 128 180 210 Z M58 210 L182 210 L182 228 L58 228 Z",
    d: "M120 126 L120 210",
  },
  clutch: {
    s: "M52 132 L188 132 Q194 132 194 138 L194 216 Q194 222 188 222 L52 222 Q46 222 46 216 L46 138 Q46 132 52 132 Z",
    d: "M48 136 L120 186 L192 136",
  },
  tote: {
    s: "M60 124 L180 124 L172 300 L68 300 Z",
    d: "M90 124 Q90 64 120 64 Q150 64 150 124",
  },
} satisfies Record<string, { s: string; d: string; b?: string }>;

const GARMENT_WORDS: [GarmentKey, RegExp][] = [
  ["headwrap", /head ?wrap|gele|turban/i],
  ["cap", /\bcap\b|fila|hat/i],
  ["stole", /stole|scarf|shawl/i],
  ["clutch", /clutch|purse|wallet/i],
  ["tote", /tote|\bbag\b/i],
  ["agbada", /agbada/i],
  ["boubou", /boubou|bubu/i],
  ["maxi", /maxi/i],
  ["shirtdress", /shirt ?dress/i],
  ["twopiece", /two-piece|2-piece|\bset\b|iro|buba/i],
  ["dress", /dress|gown/i],
  ["kaftan", /kaftan|caftan|dashiki/i],
  ["tunic", /tunic/i],
  ["overshirt", /overshirt|jacket|coat/i],
  ["shirt", /shirt/i],
  ["skirt", /skirt|wrapper/i],
  ["trousers", /trouser|pant|short/i],
  ["top", /top|blouse|tee|t-shirt|crop/i],
];

export function garmentFor(text: string): GarmentKey {
  return GARMENT_WORDS.find(([, re]) => re.test(text))?.[0] ?? "dress";
}
