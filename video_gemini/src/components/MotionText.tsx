import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, FONT } from "../theme";

export const FadeRise: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  yOffset?: number;
}> = ({ delay = 0, children, style, yOffset = 24 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, mass: 0.8 },
  });

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${(1 - progress) * yOffset}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const BadgePill: React.FC<{
  text: string;
  tone?: "accent" | "red" | "green" | "neutral";
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}> = ({ text, tone = "accent", size = "md", style }) => {
  let bg = C.accentLight;
  let color = C.accent;
  let border = "1px solid rgba(123, 150, 232, 0.3)";

  if (tone === "red") {
    bg = C.verdictRedBg;
    color = C.verdictRed;
    border = "1px solid rgba(220, 38, 38, 0.25)";
  } else if (tone === "green") {
    bg = C.verdictGreenBg;
    color = C.verdictGreen;
    border = "1px solid rgba(22, 163, 74, 0.25)";
  } else if (tone === "neutral") {
    bg = "rgba(0, 0, 0, 0.05)";
    color = C.textMuted;
    border = "1px solid rgba(0, 0, 0, 0.1)";
  }

  const padding = size === "sm" ? "4px 10px" : size === "lg" ? "8px 18px" : "6px 14px";
  const fontSize = size === "sm" ? 13 : size === "lg" ? 18 : 15;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding,
        borderRadius: 999,
        backgroundColor: bg,
        color,
        border,
        fontSize,
        fontWeight: 700,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        fontFamily: FONT,
        ...style,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          backgroundColor: color,
        }}
      />
      {text}
    </span>
  );
};

export const ActionCallout: React.FC<{
  atFrame: number;
  untilFrame?: number;
  tone?: "default" | "red" | "green" | "accent";
  badge?: string;
  title: string;
  subtitle?: string;
  style?: React.CSSProperties;
}> = ({
  atFrame,
  untilFrame = 1e9,
  tone = "default",
  badge,
  title,
  subtitle,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - atFrame,
    fps,
    config: { damping: 16, mass: 0.7 },
  });

  const exit = interpolate(frame, [untilFrame - 8, untilFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < atFrame - 1 || frame > untilFrame) {
    return null;
  }

  const opacity = enter * exit;
  let titleColor = C.textDark;
  if (tone === "red") titleColor = C.verdictRed;
  if (tone === "green") titleColor = C.verdictGreen;
  if (tone === "accent") titleColor = C.accent;

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${(1 - enter) * 28}px)`,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: "18px 24px",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
        fontFamily: FONT,
        marginBottom: 16,
        borderLeft: `5px solid ${titleColor}`,
        ...style,
      }}
    >
      {badge && (
        <div style={{ marginBottom: 6 }}>
          <BadgePill text={badge} tone={tone === "default" ? "accent" : tone} size="sm" />
        </div>
      )}
      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: titleColor,
          lineHeight: 1.2,
          letterSpacing: -0.5,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: C.textMuted,
            marginTop: 6,
            lineHeight: 1.3,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
