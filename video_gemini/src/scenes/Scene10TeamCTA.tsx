import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BANGLA, C, FONT } from "../theme";
import { BrandMark } from "../components/BrandMark";
import { FadeRise } from "../components/MotionText";

interface Member {
  name: string;
  role: string;
  image: string;
}

const TEAM_MEMBERS: Member[] = [
  { name: "Rumman", role: "Product Lead", image: "team/rumman.jpg" },
  { name: "Saleh", role: "Full-Stack Engineer", image: "team/saleh.jpg" },
  { name: "Anika", role: "ML & Verification", image: "team/anika.jpg" },
  { name: "Sami", role: "Strategy & Pitch", image: "team/sami2.jpg" },
  { name: "Mirazul", role: "Mobile Engineering", image: "team/mirazul.jpg" },
  { name: "Sami", role: "Strategy & Pitch", image: "team/sami.jpg" },
];

export const Scene10TeamCTA: React.FC<{ duration: number; lead: number }> = ({
  duration,
  lead,
}) => {
  const frame = useCurrentFrame();

  // Transition from Team Gallery to Grand Finale CTA at frame 230
  const teamOpacity = interpolate(frame, [220, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaOpacity = interpolate(frame, [230, 250], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaScale = interpolate(frame, [230, 260], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.soft,
        fontFamily: FONT,
        padding: "60px 100px",
      }}
    >
      {/* PHASE 1: Team Gallery */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "60px 100px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: teamOpacity,
          pointerEvents: teamOpacity <= 0 ? "none" : "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <BrandMark dark={false} size={40} />
          <div style={{ fontSize: 16, color: C.muted, fontWeight: 700, letterSpacing: 2 }}>
            THE BUILDERS
          </div>
        </div>

        {/* Team Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 36, flex: 1, justifyContent: "center" }}>
          <div>
            <FadeRise delay={2}>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  borderRadius: 20,
                  backgroundColor: C.accentLight,
                  color: C.accent,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                AI Builders Congress 2026
              </div>
            </FadeRise>
            <FadeRise delay={6}>
              <div
                style={{
                  fontSize: 54,
                  fontWeight: 800,
                  color: C.ink,
                  letterSpacing: -1.5,
                  lineHeight: 1.15,
                }}
              >
                We are Team Jachai.
              </div>
            </FadeRise>
          </div>

          {/* 6 Member Cards in a 6-Column Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 20 }}>
            {TEAM_MEMBERS.map((m, idx) => (
              <FadeRise key={idx} delay={10 + idx * 4}>
                <div
                  style={{
                    backgroundColor: C.card,
                    borderRadius: 24,
                    padding: "24px 16px",
                    border: `1px solid ${C.border}`,
                    boxShadow: C.shadowSoft,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 104,
                      height: 104,
                      borderRadius: 52,
                      overflow: "hidden",
                      border: `3px solid ${C.accent}`,
                      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                    }}
                  >
                    <Img
                      src={staticFile(m.image)}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, letterSpacing: -0.3 }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: 13, color: C.muted, fontWeight: 600, marginTop: 4 }}>
                      {m.role}
                    </div>
                  </div>
                </div>
              </FadeRise>
            ))}
          </div>
        </div>
      </div>

      {/* PHASE 2: Grand Finale Call to Action */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
          pointerEvents: ctaOpacity <= 0 ? "none" : "auto",
          gap: 28,
        }}
      >
        {/* Big Branded App Tile */}
        <div
          style={{
            width: 130,
            height: 130,
            borderRadius: 36,
            backgroundColor: C.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.16)",
          }}
        >
          <BrandMark dark size={86} showText={false} />
        </div>

        <div>
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              color: C.ink,
              letterSpacing: -2,
              lineHeight: 1.15,
            }}
          >
            Check it before you forward it.
          </div>
          <div
            style={{
              fontFamily: BANGLA,
              fontSize: 32,
              fontWeight: 600,
              color: C.accent,
              marginTop: 10,
            }}
          >
            শেয়ার করার আগে যাচাই করুন
          </div>
        </div>

        <div style={{ fontSize: 22, color: C.muted, fontWeight: 500, maxWidth: 800, lineHeight: 1.5 }}>
          Instant, citizen-first verification built directly into Android for Bangladesh.
        </div>

        {/* Clean URL Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 36px",
            borderRadius: 40,
            backgroundColor: C.card,
            border: `1.5px solid ${C.border}`,
            boxShadow: C.shadowSoft,
            marginTop: 12,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: C.verdictGreen,
            }}
          />
          <span style={{ fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: 0.5 }}>
            github.com/sadsal12/Jachai
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
