import React from "react";
import { Freeze, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { C } from "../theme";

interface StoryPhoneProps {
  src: string;
  height?: number;
  currentVideoFrame: number;
  buzzAt?: number | number[];
  style?: React.CSSProperties;
}

export const StoryPhone: React.FC<StoryPhoneProps> = ({
  src,
  height = 1180,
  currentVideoFrame,
  buzzAt,
  style,
}) => {
  const frame = useCurrentFrame();

  // 9:20 aspect ratio (screen width)
  const screenWidth = (height * 864) / 1920;
  const bezel = 12;
  const outerWidth = screenWidth + bezel * 2;
  const outerHeight = height + bezel * 2;
  const borderRadius = 44;

  // Vibration
  const buzzTargets = Array.isArray(buzzAt) ? buzzAt : buzzAt !== undefined ? [buzzAt] : [];
  let vibration = 0;
  let waveOpacity = 0;

  for (const b of buzzTargets) {
    if (frame >= b && frame < b + 24) {
      const delta = frame - b;
      const pulse = Math.sin((delta / 12) * Math.PI);
      vibration = Math.max(vibration, pulse);
      waveOpacity = Math.max(waveOpacity, 1 - delta / 24);
    }
  }

  const shakeX = vibration * Math.sin(frame * 3) * 10;

  const videoSrc = src.startsWith("clips/") ? src : `clips/${src}`;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `translateX(${shakeX}px)`,
        ...style,
      }}
    >
      {/* Shockwave Rings on Hoax Verdict */}
      {waveOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            width: outerWidth + 40,
            height: outerHeight + 40,
            borderRadius: borderRadius + 16,
            border: `3px solid ${C.verdictRed}`,
            opacity: waveOpacity * 0.8,
            transform: `scale(${1 + (1 - waveOpacity) * 0.12})`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Phone Body Frame */}
      <div
        style={{
          width: outerWidth,
          height: outerHeight,
          borderRadius,
          backgroundColor: "#18181B",
          padding: bezel,
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.35), 0 10px 30px rgba(0, 0, 0, 0.2)",
          border: "2px solid rgba(255, 255, 255, 0.12)",
          position: "relative",
        }}
      >
        {/* Screen */}
        <div
          style={{
            width: screenWidth,
            height,
            borderRadius: borderRadius - bezel,
            overflow: "hidden",
            backgroundColor: "#000000",
            position: "relative",
          }}
        >
          <Freeze frame={Math.max(0, currentVideoFrame)}>
            <OffthreadVideo
              src={staticFile(videoSrc)}
              muted
              style={{
                width: screenWidth,
                height,
                objectFit: "cover",
              }}
            />
          </Freeze>
        </div>

        {/* Dynamic Island / Speaker Pill */}
        <div
          style={{
            position: "absolute",
            top: 18,
            left: "50%",
            transform: "translateX(-50%)",
            width: 80,
            height: 18,
            borderRadius: 9,
            backgroundColor: "#000000",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};
