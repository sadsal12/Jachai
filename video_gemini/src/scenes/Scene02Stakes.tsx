import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { BrandMark } from "../components/BrandMark";
import { FadeRise } from "../components/MotionText";

export const Scene02Stakes: React.FC<{ duration: number; lead: number }> = ({
  duration,
}) => {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [duration - 14, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.soft,
        fontFamily: FONT,
        padding: "60px 100px",
        opacity: fadeOut,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <BrandMark dark={false} size={40} />
        <div style={{ fontSize: 16, color: C.muted, fontWeight: 700, letterSpacing: 2 }}>
          THE REAL HUMAN COST
        </div>
      </div>

      {/* Main Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 32, flex: 1, justifyContent: "center" }}>
        <div>
          <FadeRise delay={4}>
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
              Misinformation in Bangladesh
            </div>
          </FadeRise>
          <FadeRise delay={10}>
            <div
              style={{
                fontSize: 54,
                fontWeight: 800,
                color: C.ink,
                letterSpacing: -1.5,
                lineHeight: 1.15,
              }}
            >
              In Bangladesh, this is not harmless noise.
            </div>
          </FadeRise>
        </div>

        {/* 3 Horizontal Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28, marginTop: 10 }}>
          {/* Card 1: 2019 Mob Violence */}
          <FadeRise delay={16} yOffset={24}>
            <div
              style={{
                backgroundColor: C.card,
                borderRadius: 24,
                padding: "36px 30px",
                border: `1px solid ${C.border}`,
                boxShadow: C.shadowSoft,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                minHeight: 290,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: 8,
                  backgroundColor: C.verdictRedLight,
                  color: C.verdictRed,
                  fontSize: 14,
                  fontWeight: 800,
                  width: "fit-content",
                }}
              >
                2019 TRAGEDY
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.ink }}>
                Padma Bridge Rumours
              </div>
              <div style={{ fontSize: 17, color: C.muted, lineHeight: 1.55 }}>
                False claims that the bridge required human heads provoked real nationwide panic and tragic mob attacks on innocent citizens.
              </div>
            </div>
          </FadeRise>

          {/* Card 2: Generative AI */}
          <FadeRise delay={26} yOffset={24}>
            <div
              style={{
                backgroundColor: C.card,
                borderRadius: 24,
                padding: "36px 30px",
                border: `1px solid ${C.border}`,
                boxShadow: C.shadowSoft,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                minHeight: 290,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: 8,
                  backgroundColor: C.accentLight,
                  color: C.accent,
                  fontSize: 14,
                  fontWeight: 800,
                  width: "fit-content",
                }}
              >
                TODAY'S AI THREAT
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.ink }}>
                Synthetic Media
              </div>
              <div style={{ fontSize: 17, color: C.muted, lineHeight: 1.55 }}>
                Generative AI now produces convincing fake images, altered voices, and deepfake videos in seconds at zero cost.
              </div>
            </div>
          </FadeRise>

          {/* Card 3: Vulnerable Citizens */}
          <FadeRise delay={36} yOffset={24}>
            <div
              style={{
                backgroundColor: C.card,
                borderRadius: 24,
                padding: "36px 30px",
                border: `1px solid ${C.border}`,
                boxShadow: C.shadowSoft,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                minHeight: 290,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: 8,
                  backgroundColor: "#F3F4F6",
                  color: C.ink,
                  fontSize: 14,
                  fontWeight: 800,
                  width: "fit-content",
                }}
              >
                MOST EXPOSED
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.ink }}>
                Parents & Grandparents
              </div>
              <div style={{ fontSize: 17, color: C.muted, lineHeight: 1.55 }}>
                Older family members read best in Bangla, receive the most forwards, and have no practical tools to fact-check what they see.
              </div>
            </div>
          </FadeRise>
        </div>
      </div>
    </AbsoluteFill>
  );
};
