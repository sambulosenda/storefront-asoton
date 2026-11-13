// Body measurements in centimetres, from the shop size guide. The size guide shows them and the
// shop assistant suggests sizes from them (src/lib/assistant). A row is a size, then its bust or
// chest, waist and hips.
export const sizeCharts = {
  women: {
    sizeHead: "UK size",
    firstHead: "Bust",
    rows: [
      ["UK 6", 78, 60, 86],
      ["UK 8", 82, 64, 90],
      ["UK 10", 86, 68, 94],
      ["UK 12", 91, 73, 99],
      ["UK 14", 96, 78, 104],
      ["UK 16", 101, 83, 109],
      ["UK 18", 106, 88, 114],
      ["UK 20", 111, 93, 119],
    ],
    fits: [
      { style: "Wrap dresses", note: "Adjustable at the waist. Choose by bust." },
      { style: "Tops and blouses", note: "Choose by bust." },
      { style: "Boubous and kaftans", note: "Cut loose. Take your usual size, or one down for a closer fit." },
      { style: "Two-piece sets", note: "Top and wrapper are sized together. Choose by your larger measurement." },
    ],
  },
  men: {
    sizeHead: "Size",
    firstHead: "Chest",
    rows: [
      ["S", 94, 80, 96],
      ["M", 100, 86, 102],
      ["L", 106, 92, 108],
      ["XL", 112, 98, 114],
      ["XXL", 118, 104, 120],
      ["3XL", 124, 110, 126],
    ],
    fits: [
      { style: "Kaftans", note: "Cut straight with room to move. Choose by chest." },
      { style: "Agbada", note: "The outer robe is generous; the shirt and trousers follow this chart." },
      { style: "Shirts", note: "Regular fit. Size up for a relaxed look." },
    ],
  },
} as const;

/** Centimetres as inches, to the nearest half. */
export const toInches = (cm: number) => Math.round((cm / 2.54) * 2) / 2;
