import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BANGLA, C, FONT } from "../theme";
import { BrandMark } from "../components/BrandMark";
import { FadeRise } from "../components/MotionText";

export const Scene01Crisis: React.FC<{ duration: number; lead: number }> = ({
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
        padding: "60px 100px",
        opacity: fadeOut,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <BrandMark dark={false} size={40} />
        <div style={{ fontSize: 16, color: C.muted, fontWeight: 700, letterSpacing: 2 }}>
          CIVICSPHERE AI · CITIZEN FIRST
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 80, flex: 1 }}>
        {/* Left Column: Context Text */}
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
              The Forwarding Crisis
            </div>
          </FadeRise>
          <FadeRise delay={10}>
            <div
              style={{
                fontSize: 58,
                fontWeight: 800,
                color: C.ink,
                lineHeight: 1.15,
                letterSpacing: -1.5,
                marginBottom: 24,
              }}
            >
              Every viral rumour begins with an urgent forward.
            </div>
          </FadeRise>
          <FadeRise delay={18}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 500,
                color: C.muted,
                lineHeight: 1.5,
              }}
            >
              In family chats across WhatsApp and Facebook, unverified claims travel faster than the truth.
            </div>
          </FadeRise>
        </div>

        {/* Right Column: Clean WhatsApp Forward Card Simulation */}
        <div style={{ flex: 0.9, display: "flex", justifyContent: "center" }}>
          <FadeRise delay={12} yOffset={30}>
            <div
              style={{
                width: 480,
                backgroundColor: C.card,
                borderRadius: 28,
                border: `1px solid ${C.border}`,
                boxShadow: C.shadowSoft,
                padding: "32px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* Message Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "#25D366",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFFFFF",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    W
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>
                    Family Group Chat
                  </div>
                </div>
                <div style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>Just now</div>
              </div>

              {/* Forward Indicator */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  borderRadius: 8,
                  backgroundColor: "#F3F4F6",
                  color: C.muted,
                  fontSize: 13,
                  fontWeight: 600,
                  width: "fit-content",
                }}
              >
                <span>⤹ Forwarded many times</span>
              </div>

              {/* Fake Rumour Body */}
              <div
                style={{
                  fontFamily: BANGLA,
                  fontSize: 22,
                  fontWeight: 600,
                  color: C.ink,
                  lineHeight: 1.5,
                  backgroundColor: "#F8F9FA",
                  padding: "18px 20px",
                  borderRadius: 16,
                  borderLeft: `4px solid ${C.verdictRed}`,
                }}
              >
                জরুরি নোটিশ! এখনই সবার সাথে শেয়ার করুন, ডিলিট হওয়ার আগেই জেনে নিন...
              </div>

              {/* Urgency Callout */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
                <div style={{ fontSize: 14, color: C.verdictRed, fontWeight: 700 }}>
                  ⚠ Unverified Viral Claim
                </div>
                <div style={{ fontSize: 13, color: C.muted }}>Shared 50+ times</div>
              </div>
            </div>
          </FadeRise>
        </div>
      </div>
    </AbsoluteFill>
  );
};
