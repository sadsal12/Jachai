import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { BrandMark } from "../components/BrandMark";
import { FadeRise } from "../components/MotionText";

export const Scene09CivicPlan: React.FC<{ duration: number; lead: number }> = ({
  duration,
}) => {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [duration - 12, duration], [1, 0], {
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
          SUSTAINABILITY & CIVIC IMPACT
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 32, flex: 1, justifyContent: "center" }}>
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
              Public Utility Model
            </div>
          </FadeRise>
          <FadeRise delay={6}>
            <div
              style={{
                fontSize: 52,
                fontWeight: 800,
                color: C.ink,
                letterSpacing: -1.5,
                lineHeight: 1.15,
              }}
            >
              Free for all citizens. Sustainable for Bangladesh.
            </div>
          </FadeRise>
        </div>

        {/* 2-Column Comparison */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginTop: 10 }}>
          {/* Column 1: Free Public Utility */}
          <FadeRise delay={12}>
            <div
              style={{
                backgroundColor: C.card,
                borderRadius: 24,
                padding: "36px 36px",
                border: `1.5px solid ${C.border}`,
                boxShadow: C.shadowSoft,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: 8,
                  backgroundColor: C.verdictGreenLight,
                  color: C.verdictGreen,
                  fontSize: 14,
                  fontWeight: 800,
                  width: "fit-content",
                }}
              >
                100% FREE CORE
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.ink }}>
                Citizen Public Utility
              </div>
              <div style={{ fontSize: 17, color: C.muted, lineHeight: 1.55 }}>
                Free daily checks for all citizens from the Android share menu, floating bubble, or direct paste. Zero advertising, zero lock-in.
              </div>
            </div>
          </FadeRise>

          {/* Column 2: Family Protection Plan */}
          <FadeRise delay={20}>
            <div
              style={{
                backgroundColor: C.card,
                borderRadius: 24,
                padding: "36px 36px",
                border: `1.5px solid ${C.accent}`,
                boxShadow: C.shadowSoft,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                position: "relative",
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
                FAMILY SAFETY PLAN · ~৳50 / MO
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.ink }}>
                Protecting Elderly Parents
              </div>
              <div style={{ fontSize: 17, color: C.muted, lineHeight: 1.55 }}>
                Cover up to 4 devices for parents and grandparents. Direct micro-billing via bKash and local telecom carrier partnerships.
              </div>
            </div>
          </FadeRise>
        </div>
      </div>
    </AbsoluteFill>
  );
};
