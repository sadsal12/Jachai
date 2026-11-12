import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, FONT } from "../theme";

export const ViralNetworkVis: React.FC<{
  progress: number;
  style?: React.CSSProperties;
}> = ({ progress, style }) => {
  // A glowing node graph showing misinformation spreading
  const nodes = [
    { x: 300, y: 350, r: 18, origin: true, label: "1 Forward" },
    { x: 480, y: 220, r: 14, p: 0.2 },
    { x: 520, y: 460, r: 14, p: 0.25 },
    { x: 680, y: 160, r: 10, p: 0.45 },
    { x: 720, y: 280, r: 11, p: 0.5 },
    { x: 700, y: 420, r: 10, p: 0.55 },
    { x: 740, y: 530, r: 11, p: 0.6 },
    { x: 880, y: 120, r: 8, p: 0.75 },
    { x: 920, y: 220, r: 8, p: 0.8 },
    { x: 940, y: 340, r: 8, p: 0.85 },
    { x: 920, y: 480, r: 8, p: 0.9 },
    { x: 900, y: 580, r: 8, p: 0.95 },
  ];

  const links = [
    [0, 1], [0, 2],
    [1, 3], [1, 4],
    [2, 5], [2, 6],
    [3, 7], [4, 8], [4, 9],
    [5, 9], [5, 10], [6, 11]
  ];

  const count = Math.round(interpolate(progress, [0, 1], [1, 24800]));

  return (
    <div
      style={{
        position: "relative",
        width: 1100,
        height: 650,
        backgroundColor: "rgba(20, 22, 28, 0.7)",
        borderRadius: 28,
        border: `1px solid ${C.borderDark}`,
        padding: 30,
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
        fontFamily: FONT,
        ...style,
      }}
    >
      {/* Header Metric */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, letterSpacing: 2, textTransform: "uppercase" }}>
            Misinformation Velocity Simulation
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: C.textWhite, marginTop: 4 }}>
            Unchecked Forward Cascades
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textLightMuted, textTransform: "uppercase" }}>
            Estimated Phones Reached
          </div>
          <div style={{ fontSize: 44, fontWeight: 900, color: C.verdictRed, fontVariantNumeric: "tabular-nums" }}>
            {count.toLocaleString()}+
          </div>
        </div>
      </div>

      {/* SVG Network */}
      <svg width="100%" height="480" viewBox="200 80 800 520" style={{ marginTop: 20 }}>
        {links.map(([fromIdx, toIdx], i) => {
          const from = nodes[fromIdx];
          const to = nodes[toIdx];
          const minP = to.p || 0.1;
          const linkOpacity = Math.max(0, Math.min(1, (progress - minP * 0.7) / 0.3));

          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={C.accent}
              strokeWidth={Math.max(1.5, 3 * (1 - (to.p || 0.5) * 0.5))}
              opacity={linkOpacity * 0.45}
              strokeDasharray={progress > minP ? "none" : "4 4"}
            />
          );
        })}

        {nodes.map((n, i) => {
          const visible = n.origin || progress >= (n.p || 0);
          const nodeScale = n.origin ? 1 : Math.max(0, Math.min(1, (progress - (n.p || 0)) / 0.15));

          return (
            <g key={i} transform={`translate(${n.x}, ${n.y}) scale(${nodeScale})`}>
              <circle
                r={n.r * 1.8}
                fill={n.origin ? C.accentGlow : "rgba(220, 38, 38, 0.2)"}
                opacity={visible ? 1 : 0}
              />
              <circle
                r={n.r}
                fill={n.origin ? C.accent : C.verdictRed}
                opacity={visible ? 1 : 0}
              />
              {n.label && (
                <text
                  x={-28}
                  y={34}
                  fill={C.textWhite}
                  fontSize={15}
                  fontWeight={700}
                  fontFamily={FONT}
                >
                  {n.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const SpeedComparisonVis: React.FC<{
  progress: number;
}> = ({ progress }) => {
  const p = Math.max(0, Math.min(1, progress));

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: "32px 36px",
        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)",
        fontFamily: FONT,
        width: 620,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: 1.5 }}>
        Verification Latency Benchmark
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.textDark, marginTop: 4, marginBottom: 28 }}>
        Stopping Rumours in the Golden Window
      </div>

      {/* Traditional Fact-Check */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 16, fontWeight: 600 }}>
          <span style={{ color: C.textMuted }}>Traditional Web Fact-Check</span>
          <span style={{ color: C.verdictRed, fontWeight: 700 }}>4 to 24 Hours</span>
        </div>
        <div style={{ height: 14, backgroundColor: "#F3F4F6", borderRadius: 999, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${p * 92}%`,
              backgroundColor: C.verdictRed,
              borderRadius: 999,
            }}
          />
        </div>
        <div style={{ fontSize: 13, color: C.textMuted, marginTop: 6 }}>
          Requires app switching, Google searches, and long articles (rumour already spreads).
        </div>
      </div>

      {/* Jachai */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 16, fontWeight: 700 }}>
          <span style={{ color: C.textDark, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: C.accent }} />
            Jachai Point-of-Sharing
          </span>
          <span style={{ color: C.accent, fontWeight: 800, fontSize: 20 }}>3.8 Seconds</span>
        </div>
        <div style={{ height: 18, backgroundColor: C.accentLight, borderRadius: 999, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${p * 18}%`,
              backgroundColor: C.accent,
              borderRadius: 999,
            }}
          />
        </div>
        <div style={{ fontSize: 13, color: C.accent, marginTop: 6, fontWeight: 600 }}>
          Instant full-screen verdict in WhatsApp before the forward button is tapped.
        </div>
      </div>
    </div>
  );
};
