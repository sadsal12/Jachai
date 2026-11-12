import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BANGLA, C, FONT } from "../theme";
import { BrandMark } from "../components/BrandMark";
import { StoryPhone } from "./StoryPhone";

// ==============================================================================
// 1. STORY HOOK (0:00 - 0:04)
// ==============================================================================
export const StoryHook: React.FC<{ duration: number; lead: number }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0F1117",
        fontFamily: FONT,
        padding: "100px 60px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <BrandMark dark size={44} />
      </div>

      {/* Main Punchy Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 28,
          transform: `scale(${pop})`,
        }}
      >
        <div
          style={{
            padding: "10px 24px",
            borderRadius: 30,
            backgroundColor: "#DC2626",
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: 2,
            textTransform: "uppercase",
            boxShadow: "0 10px 30px rgba(220, 38, 38, 0.4)",
          }}
        >
          🚨 VIRAL FORWARD ALERT
        </div>

        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: "#FFFFFF",
            lineHeight: 1.15,
            letterSpacing: -1.5,
            maxWidth: 900,
          }}
        >
          Someone forwards a shocking rumour to your family chat.
        </div>

        {/* Realistic WhatsApp Bubble Mockup */}
        <div
          style={{
            backgroundColor: "#1F2937",
            borderRadius: 28,
            padding: "28px 32px",
            border: "1.5px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
            maxWidth: 860,
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: "#25D366",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              W
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF" }}>Family WhatsApp Group</div>
              <div style={{ fontSize: 14, color: "#9CA3AF" }}>Forwarded many times · 10:45 PM</div>
            </div>
          </div>
          <div
            style={{
              fontFamily: BANGLA,
              fontSize: 28,
              fontWeight: 600,
              color: "#F3F4F6",
              backgroundColor: "#111827",
              padding: "20px 24px",
              borderRadius: 18,
              borderLeft: "5px solid #EF4444",
              lineHeight: 1.45,
            }}
          >
            জরুরি সতর্কতা! পদ্মা সেতুতে মানুষের মাথা কাটা হচ্ছে, শিশুদের সাবধানে রাখুন!
          </div>
        </div>
      </div>

      {/* Bottom Teaser */}
      <div style={{ fontSize: 22, color: "#9CA3AF", fontWeight: 600 }}>
        Share before it gets deleted?
      </div>
    </AbsoluteFill>
  );
};

// ==============================================================================
// 2. STORY PROBLEM (0:04 - 0:09)
// ==============================================================================
export const StoryProblem: React.FC<{ duration: number; lead: number }> = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0F1117",
        fontFamily: FONT,
        padding: "100px 60px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <BrandMark dark size={44} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 32,
        }}
      >
        <div
          style={{
            padding: "8px 22px",
            borderRadius: 30,
            backgroundColor: "rgba(92, 107, 192, 0.25)",
            color: "#8CA8F9",
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          The Dilemma
        </div>

        <div
          style={{
            fontSize: 58,
            fontWeight: 900,
            color: "#FFFFFF",
            lineHeight: 1.15,
            letterSpacing: -1.5,
            maxWidth: 900,
          }}
        >
          Before anyone panics... how do you know if it's real or an AI fake?
        </div>

        {/* 2 Split Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, width: "100%", maxWidth: 880, marginTop: 20 }}>
          <div
            style={{
              backgroundColor: "rgba(220, 38, 38, 0.15)",
              border: "2px solid #DC2626",
              borderRadius: 24,
              padding: "32px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 8 }}>🎭</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#EF4444" }}>AI Deepfake?</div>
            <div style={{ fontSize: 16, color: "#D1D5DB", marginTop: 8 }}>Generated in seconds to deceive</div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(92, 107, 192, 0.15)",
              border: "2px solid #5C6BC0",
              borderRadius: 24,
              padding: "32px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 8 }}>📰</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#8CA8F9" }}>Viral Hoax?</div>
            <div style={{ fontSize: 16, color: "#D1D5DB", marginTop: 8 }}>Recycled rumours causing panic</div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 24, color: "#FFFFFF", fontWeight: 700 }}>
        Don't guess. Verify in 3 seconds. ⚡
      </div>
    </AbsoluteFill>
  );
};

// ==============================================================================
// 3. STORY DEMO: WHATSAPP SHARE (0:09 - 0:17)
// ==============================================================================
export const StoryDemoShare: React.FC<{ duration: number; lead: number }> = ({ lead }) => {
  const frame = useCurrentFrame();

  const vf = frame - lead;

  // Syllable-synced frame mapping for A-whatsapp-take1.mp4:
  // "tap Share" at vf 35
  // "choose Jah-chai" at vf 69
  // "Known hoax" red screen at vf 181
  const storyFrameMap = (f: number) => {
    const v = f - lead;
    if (v <= 0) return 40;
    if (v <= 35) {
      return Math.round(40 + (v / 35) * 108); // up to share tap
    }
    if (v <= 69) {
      return Math.round(interpolate(v, [35, 69], [148, 226])); // select Jachai icon
    }
    if (v <= 110) {
      return Math.round(interpolate(v, [69, 110], [226, 248])); // spinner opens
    }
    if (v <= 181) {
      const cycle = (v - 110) % 36;
      return Math.round(250 + (cycle / 36) * 48); // spinner loop
    }
    // Red hoax screen from frame 181 onwards
    return Math.min(466, Math.round(305 + (v - 181)));
  };

  const isRedHoax = vf >= 181;
  const isSelectStep = vf >= 69;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0F1117",
        fontFamily: FONT,
        padding: "80px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Dynamic Animated Status Header */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div
          style={{
            padding: "8px 24px",
            borderRadius: 30,
            backgroundColor: isRedHoax ? "#DC2626" : isSelectStep ? "#5C6BC0" : "#25D366",
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
            transition: "all 0.2s ease",
          }}
        >
          {isRedHoax ? "💥 KNOWN HOAX DETECTED" : isSelectStep ? "⚡ VERIFYING WITH JACHAI" : "📲 SHARE DIRECTLY"}
        </div>
        <div style={{ fontSize: 36, fontWeight: 900, color: "#FFFFFF", letterSpacing: -0.5 }}>
          {isRedHoax ? "Full-screen answer in 3s." : "Tap Share ➔ Choose Jachai"}
        </div>
      </div>

      {/* Vertical Phone Screen Display */}
      <StoryPhone
        src="clips/A-whatsapp-take1.mp4"
        height={1220}
        currentVideoFrame={storyFrameMap(frame)}
        buzzAt={lead + 181}
      />

      {/* Floating Action Callout */}
      <div
        style={{
          padding: "14px 28px",
          borderRadius: 20,
          backgroundColor: isRedHoax ? "rgba(220, 38, 38, 0.25)" : "rgba(255, 255, 255, 0.1)",
          border: `1.5px solid ${isRedHoax ? "#EF4444" : "rgba(255, 255, 255, 0.2)"}`,
          color: "#FFFFFF",
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        {isRedHoax ? "📳 Double Vibration Alert + Plain Bangla Fact" : "No copying, pasting, or leaving WhatsApp"}
      </div>
    </AbsoluteFill>
  );
};

// ==============================================================================
// 4. STORY DEMO: FLOATING BUBBLE (0:17 - 0:24)
// ==============================================================================
export const StoryDemoBubble: React.FC<{ duration: number; lead: number }> = ({ lead }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0F1117",
        fontFamily: FONT,
        padding: "80px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div
          style={{
            padding: "8px 24px",
            borderRadius: 30,
            backgroundColor: "#5C6BC0",
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          Floating Screen Bubble
        </div>
        <div style={{ fontSize: 36, fontWeight: 900, color: "#FFFFFF", letterSpacing: -0.5 }}>
          Check posts on Facebook or TikTok
        </div>
      </div>

      <StoryPhone
        src="clips/B-bubble-take1.mp4"
        height={1220}
        currentVideoFrame={Math.max(0, 30 + Math.max(0, frame - lead))}
      />

      <div
        style={{
          padding: "14px 28px",
          borderRadius: 20,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          border: "1.5px solid rgba(255, 255, 255, 0.2)",
          color: "#FFFFFF",
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        Tap the floating bubble for instant screen analysis ✨
      </div>
    </AbsoluteFill>
  );
};

// ==============================================================================
// 5. STORY TEAM & CTA (0:24 - 0:38)
// ==============================================================================
const TEAM = [
  { name: "Rumman", role: "Product Lead", img: "team/rumman.jpg" },
  { name: "Saleh", role: "Full-Stack", img: "team/saleh.jpg" },
  { name: "Anika", role: "ML Engineer", img: "team/anika.jpg" },
  { name: "Sami", role: "Strategy", img: "team/sami2.jpg" },
  { name: "Mirazul", role: "Mobile Eng", img: "team/mirazul.jpg" },
  { name: "Sami", role: "Pitch", img: "team/sami.jpg" },
];

export const StoryTeamCTA: React.FC<{ duration: number; lead: number }> = () => {
  const frame = useCurrentFrame();

  // Transition from team to finale CTA at frame 210
  const teamOpacity = interpolate(frame, [190, 210], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaOpacity = interpolate(frame, [205, 225], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0F1117",
        fontFamily: FONT,
        padding: "80px 50px",
      }}
    >
      {/* Phase 1: Team Showcase */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "80px 50px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: teamOpacity,
          pointerEvents: teamOpacity <= 0 ? "none" : "auto",
        }}
      >
        <BrandMark dark size={44} />

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, color: "#8CA8F9", fontWeight: 800, textTransform: "uppercase", letterSpacing: 2 }}>
            AI Builders Congress 2026
          </div>
          <div style={{ fontSize: 56, fontWeight: 900, color: "#FFFFFF", marginTop: 8 }}>
            Built by Team Jachai
          </div>
        </div>

        {/* 2x3 Circular Avatar Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, width: "100%", maxWidth: 840 }}>
          {TEAM.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                padding: "16px 20px",
                borderRadius: 24,
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  overflow: "hidden",
                  border: "2.5px solid #5C6BC0",
                }}
              >
                <Img
                  src={staticFile(m.img)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#FFFFFF" }}>{m.name}</div>
                <div style={{ fontSize: 16, color: "#9CA3AF", fontWeight: 600 }}>{m.role}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 20, color: "#D1D5DB", fontWeight: 600 }}>
          CivicSphere AI · Citizen First
        </div>
      </div>

      {/* Phase 2: Grand Finale Call to Action */}
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
          pointerEvents: ctaOpacity <= 0 ? "none" : "auto",
          gap: 32,
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 40,
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
          }}
        >
          <BrandMark dark={false} size={90} showText={false} />
        </div>

        <div>
          <div style={{ fontSize: 64, fontWeight: 900, color: "#FFFFFF", letterSpacing: -2, lineHeight: 1.15 }}>
            Check it before you forward it.
          </div>
          <div style={{ fontFamily: BANGLA, fontSize: 36, color: "#8CA8F9", fontWeight: 700, marginTop: 12 }}>
            শেয়ার করার আগে যাচাই করুন
          </div>
        </div>

        <div style={{ fontSize: 24, color: "#D1D5DB", maxWidth: 700, lineHeight: 1.5 }}>
          Instant, citizen-first verification built directly into Android for Bangladesh.
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "20px 44px",
            borderRadius: 40,
            backgroundColor: "#5C6BC0",
            color: "#FFFFFF",
            fontSize: 26,
            fontWeight: 800,
            boxShadow: "0 15px 40px rgba(92, 107, 192, 0.4)",
            marginTop: 16,
          }}
        >
          <span>github.com/sadsal12/Jachai</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
