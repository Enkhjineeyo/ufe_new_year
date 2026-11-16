import { ImageResponse } from "next/og";

export const alt = "UFE NEW YEAR 2027 — THE NIGHT TO REMEMBER.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at 50% 120%, #2a3aa8 0%, #11141B 45%, #08090D 75%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 12, color: "#C7CCD5" }}>
          UNIVERSITY OF FINANCE AND ECONOMICS
        </div>
        <div style={{ fontSize: 120, fontWeight: 800, marginTop: 24 }}>
          NEW YEAR 2027
        </div>
        <div style={{ fontSize: 40, letterSpacing: 10, color: "#C7CCD5", marginTop: 12 }}>
          THE NIGHT TO REMEMBER.
        </div>
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#536DFF", marginTop: 40 }}>
          19 DECEMBER 2026 · CORPORATE CONVENTION CENTRE
        </div>
      </div>
    ),
    size,
  );
}
