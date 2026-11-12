import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { BrandMark } from "../components/BrandMark";
import { FadeRise } from "../components/MotionText";

export const Scene08PrivacyArch: React.FC<{ duration: number; lead: number }> = ({
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
          ARCHITECTURE & DATA PROTECTION
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
              Privacy by Design
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
              Zero user accounts. Zero retained data.
            </div>
          </FadeRise>
        </div>

        {/* 4 Pillars Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 10 }}>
          {/* Card 1 */}
          <FadeRise delay={12}>
            <div
              style={{
                backgroundColor: C.card,
                borderRadius: 24,
                padding: "32px 32px",
                border: `1px solid ${C.border}`,
                boxShadow: C.shadowSoft,
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, marginBottom: 8 }}>
                0 Accounts or Logins
              </div>
              <div style={{ fontSize: 16, color: C.muted, lineHeight: 1.55 }}>
                No phone number, email, or profile required. Every citizen receives identical, private access without identity friction.
              </div>
            </div>
          </FadeRise>

          {/* Card 2 */}
          <FadeRise delay={18}>
            <div
              style={{
                backgroundColor: C.card,
                borderRadius: 24,
                padding: "32px 32px",
                border: `1px solid ${C.border}`,
                boxShadow: C.shadowSoft,
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 800, color: C.accent, marginBottom: 8 }}>
                Ephemeral Memory
              </div>
              <div style={{ fontSize: 16, color: C.muted, lineHeight: 1.55 }}>
                Uploaded images and claims are held strictly in temporary RAM and destroyed ~30 seconds after verification finishes.
              </div>
            </div>
          </FadeRise>

          {/* Card 3 */}
          <FadeRise delay={24}>
            <div
              style={{
                backgroundColor: C.card,
                borderRadius: 24,
                padding: "32px 32px",
                border: `1px solid ${C.border}`,
                boxShadow: C.shadowSoft,
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, marginBottom: 8 }}>
                Zero Cloud LLM APIs
              </div>
              <div style={{ fontSize: 16, color: C.muted, lineHeight: 1.55 }}>
                No commercial third-party LLM APIs touch user data. All OCR, fuzzy matching, and ViT inference run locally.
              </div>
            </div>
          </FadeRise>

          {/* Card 4 */}
          <FadeRise delay={30}>
            <div
              style={{
                backgroundColor: C.card,
                borderRadius: 24,
                padding: "32px 32px",
                border: `1px solid ${C.border}`,
                boxShadow: C.shadowSoft,
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 800, color: C.verdictGreen, marginBottom: 8 }}>
                Single Docker Container
              </div>
              <div style={{ fontSize: 16, color: C.muted, lineHeight: 1.55 }}>
                Stateless FastAPI container deployable on any cloud host, railway, or local edge server with predictable performance.
              </div>
            </div>
          </FadeRise>
        </div>
      </div>
    </AbsoluteFill>
  );
};
