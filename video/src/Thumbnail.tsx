import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { AppTile } from "./components";
import { C, FONT } from "./theme";

/** 1280 x 720 YouTube thumbnail: the promise on the left, a real red verdict on the right. */
export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.paper, fontFamily: FONT, flexDirection: "row", alignItems: "center", padding: "0 70px" }}>
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 34 }}>
        <AppTile size={92} />
        <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2, color: C.ink }}>Jachai</div>
      </div>
      <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2.5, lineHeight: 1.04, color: C.ink }}>
        Check it<br />before you<br /><span style={{ color: C.red }}>forward it.</span>
      </div>
    </div>
    <div style={{ width: 300, height: 640, borderRadius: 46, background: "#0B0B0C", padding: 10, transform: "rotate(4deg)",
      boxShadow: "0 30px 70px rgba(0,0,0,0.3)" }}>
      <Img src={staticFile("brand/verdict.png")} style={{ width: "100%", height: "100%", borderRadius: 36, objectFit: "cover" }} />
    </div>
  </AbsoluteFill>
);
