import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { BrandMark } from "../components/BrandMark";
import { PhoneMockup } from "../components/PhoneMockup";
import { FadeRise } from "../components/MotionText";

export const Scene06VisionCheck: React.FC<{ duration: number; lead: number }> = ({
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
          LOCAL MULTIMODAL · PHOTOS & DEEPFAKES
        </div>
      </div>

      {/* Main Split Content */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, gap: 60 }}>
        {/* Left Column */}
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
              Multimodal Pipeline
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
              Spot AI fakes and read image text.
            </div>
          </FadeRise>

          <FadeRise delay={12}>
            <div style={{ fontSize: 20, color: C.muted, lineHeight: 1.5 }}>
              Screenshots go through dual-language Bangla & English OCR. Photos run through a local ViT vision classifier to detect generative artifacts.
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
                <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, marginBottom: 4 }}>
                  Tesseract 5 OCR
                </div>
                <div style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>
                  Bangla + English extraction
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
                <div style={{ fontSize: 22, fontWeight: 800, color: C.accent, marginBottom: 4 }}>
                  Local ViT Model
                </div>
                <div style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>
                  0.3s latency · Zero cloud fees
                </div>
              </div>
            </FadeRise>
          </div>
        </div>

        {/* Right Column: Floating Phone with D-photo-take1.mp4 */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <PhoneMockup
            src="D-photo-take1.mp4"
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
