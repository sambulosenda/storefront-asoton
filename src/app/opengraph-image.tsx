import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.brand}: contemporary clothing cut from West African cloth`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The card shown when a page without its own image is shared. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#1e2a55",
          color: "#f5f4f1",
        }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          {["#f5f4f1", "#c9a227", "#a84a2e", "#2f5a3a"].map((c) => (
            <div key={c} style={{ width: 56, height: 8, background: c }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 128, letterSpacing: -4, lineHeight: 1 }}>{site.brand}</div>
          <div style={{ fontSize: 36, opacity: 0.8 }}>Ankara, kente, dashiki and embroidered cloth, cut into modern shapes.</div>
        </div>
      </div>
    ),
    size,
  );
}
