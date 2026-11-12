import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { BrandMark } from "../components/BrandMark";
import { PhoneMockup } from "../components/PhoneMockup";
import { FadeRise } from "../components/MotionText";

export const Scene04ShareDemo: React.FC<{ duration: number; lead: number }> = ({
  duration,
  lead,
}) => {
  const frame = useCurrentFrame();

  const A_RED_VF = 275; // frame 275 from voice start (approx 9.17s, exactly on "Known hoax")
  const BUZZ_VF = 452;  // frame on word "buzz" (~15.09s)

  const whatsappFrameMap = (f: number) => {
    const vf = f - lead;
    if (vf <= 0) return 40;
    // 0s to 2.97s: chat conversation -> Share tap (frame 148)
    if (vf <= 89) {
      return Math.round(40 + (vf / 89) * 108);
    }
    // 2.97s to 4.07s: "select Jachai" -> Jachai icon tap (frame 226)
    if (vf <= 122) {
      return Math.round(interpolate(vf, [89, 122], [148, 226]));
    }
    // 4.07s to 5.5s: app opens, spinner starts (frame 248)
    if (vf <= 165) {
      return Math.round(interpolate(vf, [122, 165], [226, 248]));
    }
    // 5.5s to 9.17s: spinner loop
    if (vf <= A_RED_VF) {
      const cycle = (vf - 165) % 36;
      return Math.round(250 + (cycle / 36) * 48);
    }
    // From 9.17s onwards: "Known hoax. Very sure..."
    // Frame 305 is the red screen! Plays 1x
    return Math.min(466, Math.round(305 + (vf - A_RED_VF)));
  };

  const fadeOut = interpolate(frame, [duration - 12, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const vf = frame - lead;
  const isShareStep = vf >= 89;
  const isSelectStep = vf >= 122;
  const isHoaxStep = vf >= 272;

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
          LIVE DEMO · WHATSAPP SHARE
        </div>
      </div>

      {/* Main Split Content */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, gap: 60 }}>
        {/* Left Column: Interactive Synchronized Step Cards */}
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
                marginBottom: 8,
              }}
            >
              Zero Context Switching
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
                marginBottom: 10,
              }}
            >
              Check claims inside WhatsApp.
            </div>
          </FadeRise>

          {/* Step 1 */}
          <div
            style={{
              padding: "18px 24px",
              borderRadius: 20,
              backgroundColor: isShareStep ? C.card : "#F2F3F5",
              border: `1.5px solid ${isShareStep ? C.accent : "transparent"}`,
              boxShadow: isShareStep ? C.shadowSoft : "none",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isShareStep ? C.accent : C.muted,
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              1
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.ink }}>Tap Share</div>
              <div style={{ fontSize: 14, color: C.muted }}>Forward sheet opens without leaving the chat</div>
            </div>
          </div>

          {/* Step 2 */}
          <div
            style={{
              padding: "18px 24px",
              borderRadius: 20,
              backgroundColor: isSelectStep ? C.card : "#F2F3F5",
              border: `1.5px solid ${isSelectStep ? C.accent : "transparent"}`,
              boxShadow: isSelectStep ? C.shadowSoft : "none",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isSelectStep ? C.accent : C.muted,
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              2
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.ink }}>Select Jachai</div>
              <div style={{ fontSize: 14, color: C.muted }}>Instant local query against 45 verified hoaxes</div>
            </div>
          </div>

          {/* Step 3: Verdict Callout */}
          <div
            style={{
              padding: "20px 24px",
              borderRadius: 20,
              backgroundColor: isHoaxStep ? C.verdictRedLight : "#F2F3F5",
              border: `2px solid ${isHoaxStep ? C.verdictRed : "transparent"}`,
              boxShadow: isHoaxStep ? "0 12px 30px rgba(198, 40, 40, 0.15)" : "none",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isHoaxStep ? C.verdictRed : C.muted,
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              ✓
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: isHoaxStep ? C.verdictRed : C.ink }}>
                {isHoaxStep ? "Known Hoax · Very Sure" : "Awaiting Verdict"}
              </div>
              <div style={{ fontSize: 14, color: isHoaxStep ? C.ink : C.muted }}>
                {isHoaxStep ? "Double vibration alert & bilingual guidance" : "Full-screen answer in seconds"}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: High-Res Floating Phone Frame */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <PhoneMockup
            src="A-whatsapp-take1.mp4"
            height={850}
            frameMap={whatsappFrameMap}
            buzzAt={BUZZ_VF + lead}
            style={{ boxShadow: C.shadowPhone }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
