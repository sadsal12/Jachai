import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { BrandMark } from "../components/BrandMark";
import { PhoneMockup } from "../components/PhoneMockup";
import { FadeRise } from "../components/MotionText";

export const Scene05TextCheck: React.FC<{ duration: number; lead: number }> = ({
  duration,
  lead,
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
        padding: "50px 100px",
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
          IN-APP VERIFICATION · CHECK A TEXT
        </div>
      </div>

      {/* Main Split Content */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, gap: 60 }}>
        {/* Left Column: Feature Breakdown */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
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
              }}
            >
              Hybrid Matcher Engine
            </div>
          </FadeRise>

          <FadeRise delay={6}>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: C.ink,
                letterSpacing: -1,
                lineHeight: 1.15,
              }}
            >
              Paste and check any text.
            </div>
          </FadeRise>

          <FadeRise delay={12}>
            <div style={{ fontSize: 20, color: C.muted, lineHeight: 1.5 }}>
              One tap pastes the clipboard. Jachai compares claims against 45 verified national hoaxes in Bangla and English.
            </div>
          </FadeRise>

          {/* Highlights Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 10 }}>
            <FadeRise delay={16}>
              <div
                style={{
                  padding: "20px 22px",
                  borderRadius: 20,
                  backgroundColor: C.card,
                  border: `1px solid ${C.border}`,
                  boxShadow: C.shadowSoft,
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: C.accent, marginBottom: 4 }}>
                  45 Hoaxes
                </div>
                <div style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>
                  Curated bilingual library
                </div>
              </div>
            </FadeRise>

            <FadeRise delay={22}>
              <div
                style={{
                  padding: "20px 22px",
                  borderRadius: 20,
                  backgroundColor: C.card,
                  border: `1px solid ${C.border}`,
                  boxShadow: C.shadowSoft,
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: C.verdictGreen, marginBottom: 4 }}>
                  Honest RAG
                </div>
                <div style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>
                  Says when unsure · Never guesses
                </div>
              </div>
            </FadeRise>
          </div>
        </div>

        {/* Right Column: Floating Phone with C-text-take1.mp4 */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <PhoneMockup
            src="C-text-take1.mp4"
            height={850}
            startFrame={30}
            playAt={lead}
            style={{ boxShadow: C.shadowPhone }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
