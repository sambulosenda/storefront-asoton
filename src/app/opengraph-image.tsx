import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.brand}: contemporary clothing cut from West African cloth`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The card shown when a page without its own image is shared. */
export default async function OpengraphImage() {
  // The JT Aphrique mark, drawn from the logo on the shop's current site.
  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), "public/logo.png"))).toString("base64")}`;
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
          background: "#f5f4f1",
          color: "#141310",
        }}
      >
        <img src={logo} width={840} height={178} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 72, letterSpacing: -2, lineHeight: 1 }}>{site.brand}</div>
          <div style={{ fontSize: 36, color: "#57534c" }}>Ankara, kente, dashiki and embroidered cloth, cut into modern shapes.</div>
        </div>
      </div>
    ),
    size,
  );
}
