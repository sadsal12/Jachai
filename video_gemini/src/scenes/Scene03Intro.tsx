import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { BrandMark } from "../components/BrandMark";
import { FadeRise } from "../components/MotionText";

export const Scene03Intro: React.FC<{ duration: number; lead: number }> = ({
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
          THE BREAKTHROUGH
        </div>
      </div>

      {/* Main Section */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 80, flex: 1 }}>
        {/* Left Column */}
        <div style={{ flex: 1.1 }}>
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
                marginBottom: 20,
              }}
            >
              Point-of-Forwarding Verification
            </div>
          </FadeRise>
          <FadeRise delay={10}>
            <div
              style={{
                fontSize: 54,
                fontWeight: 800,
                color: C.ink,
                lineHeight: 1.18,
                letterSpacing: -1.5,
                marginBottom: 24,
              }}
            >
              Traditional fact-checking happens too late.
            </div>
          </FadeRise>
          <FadeRise delay={18}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 500,
                color: C.muted,
                lineHeight: 1.55,
              }}
            >
              Leaving chat apps to search foreign websites and read long English articles never happens at the moment of forwarding.
            </div>
          </FadeRise>
        </div>

        {/* Right Column: Hero Meet Jachai Card */}
        <div style={{ flex: 0.9, display: "flex", justifyContent: "center" }}>
          <FadeRise delay={24} yOffset={30}>
            <div
              style={{
                width: 480,
                backgroundColor: C.card,
                borderRadius: 32,
                padding: "44px 40px",
                border: `1px solid ${C.border}`,
                boxShadow: C.shadowSoft,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 20,
              }}
            >
              {/* App Icon Mark */}
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 26,
                  backgroundColor: C.ink,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
                }}
              >
                <BrandMark dark size={64} showText={false} />
              </div>

              <div>
                <div style={{ fontSize: 40, fontWeight: 800, color: C.ink, letterSpacing: -0.5 }}>
                  Meet Jachai
                </div>
                <div style={{ fontSize: 18, color: C.accent, fontWeight: 700, marginTop: 4 }}>
                  যাচাই · Instant Citizen Verification
                </div>
              </div>

              <div style={{ fontSize: 17, color: C.muted, lineHeight: 1.5 }}>
                Built directly into Android, stopping misinformation at the exact second of sharing.
              </div>

              {/* Speed Metric Pill */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "16px 20px",
                  borderRadius: 16,
                  backgroundColor: C.soft,
                  border: `1px solid ${C.border}`,
                  marginTop: 8,
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>Web Fact-Checking</div>
                  <div style={{ fontSize: 18, color: C.ink, fontWeight: 700 }}>4 – 24 Hours</div>
                </div>
                <div style={{ fontSize: 24, color: C.accent }}>➔</div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>Jachai Latency</div>
                  <div style={{ fontSize: 22, color: C.verdictGreen, fontWeight: 800 }}>&lt; 3 Seconds</div>
                </div>
              </div>
            </div>
          </FadeRise>
        </div>
      </div>
    </AbsoluteFill>
  );
};
