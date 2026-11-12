import React from "react";
import { C, FONT } from "../theme";

export const BrandMark: React.FC<{
  dark?: boolean;
  size?: number;
  showText?: boolean;
  style?: React.CSSProperties;
}> = ({ dark = false, size = 36, showText = true, style }) => {
  const textColor = dark ? C.textWhite : C.textDark;
  
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: FONT,
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="16"
          y="16"
          width="224"
          height="224"
          rx="56"
          fill={dark ? C.textWhite : C.textDark}
        />
        {/* Modern J curve in soft white/dark */}
        <path
          d="M142 124V160C142 184 122 204 98 204C92 204 88 204 88 204"
          stroke={dark ? C.textDark : C.bgCard}
          strokeWidth="32"
          strokeLinecap="round"
        />
        {/* Floating periwinkle dot */}
        <circle cx="184" cy="72" r="32" fill={C.accent} />
      </svg>
      {showText && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span
            style={{
              fontSize: size * 0.75,
              fontWeight: 800,
              color: textColor,
              letterSpacing: -0.5,
            }}
          >
            Jachai
          </span>
          <span
            style={{
              fontSize: size * 0.42,
              fontWeight: 600,
              color: C.accent,
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            Citizen First
          </span>
        </div>
      )}
    </div>
  );
};
