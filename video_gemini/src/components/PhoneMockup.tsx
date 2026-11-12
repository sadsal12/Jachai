import React from "react";
import {
  Freeze,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C } from "../theme";

interface PhoneMockupProps {
  src: string;
  height?: number;
  startFrame?: number;
  playAt?: number;
  frameMap?: (frame: number) => number;
  buzzAt?: number | number[];
  style?: React.CSSProperties;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  src,
  height = 860,
  startFrame = 0,
  playAt = 0,
  frameMap,
  buzzAt,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 9:20 phone aspect ratio (864 x 1920)
  const screenWidth = (height * 864) / 1920;
  const bezelWidth = 14;
  const outerWidth = screenWidth + bezelWidth * 2;
  const outerHeight = height + bezelWidth * 2;
  const borderRadius = 48;

  // Entrance spring animation
  const entrance = spring({
    frame,
    fps,
    config: { damping: 16, mass: 0.8 },
  });

  // Calculate buzz vibrations
  const buzzTargets = Array.isArray(buzzAt) ? buzzAt : buzzAt !== undefined ? [buzzAt] : [];
  let vibration = 0;
  let waveOpacity = 0;

  for (const b of buzzTargets) {
    if (frame >= b && frame < b + 30) {
      const delta = frame - b;
      // Double pulse: 0..10 and 15..25
      const pulse1 = delta < 10 ? Math.sin((delta / 10) * Math.PI) : 0;
      const pulse2 = delta >= 14 && delta < 24 ? Math.sin(((delta - 14) / 10) * Math.PI) : 0;
      vibration = Math.max(vibration, pulse1 + pulse2);
      waveOpacity = Math.max(waveOpacity, 1 - delta / 30);
    }
  }

  const shakeX = vibration * Math.sin(frame * 2.8) * 8;
  const shakeRot = vibration * Math.sin(frame * 2.8) * 0.15;

  // Video playback frame
  let currentVideoFrame = 0;
  if (frameMap) {
    currentVideoFrame = frameMap(frame);
  } else {
    currentVideoFrame = Math.max(0, startFrame + Math.max(0, frame - playAt));
  }

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `translateY(${(1 - entrance) * 36}px) translateX(${shakeX}px) rotate(${shakeRot}deg) scale(${
          0.96 + entrance * 0.04
        })`,
        opacity: entrance,
        ...style,
      }}
    >
      {/* Vibration Haptic Wave Rings */}
      {waveOpacity > 0 && (
        <>
          <div
            style={{
              position: "absolute",
              width: outerWidth + 48,
              height: outerHeight + 48,
              borderRadius: borderRadius + 16,
              border: `2px solid ${C.verdictRed}`,
              opacity: waveOpacity * 0.7,
              transform: `scale(${1 + (1 - waveOpacity) * 0.08})`,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: outerWidth + 88,
              height: outerHeight + 88,
              borderRadius: borderRadius + 24,
              border: `1.5px solid ${C.verdictRed}`,
              opacity: waveOpacity * 0.4,
              transform: `scale(${1 + (1 - waveOpacity) * 0.14})`,
              pointerEvents: "none",
            }}
          />
        </>
      )}

      {/* Phone Body Frame */}
      <div
        style={{
          width: outerWidth,
          height: outerHeight,
          backgroundColor: "#161820",
          borderRadius,
          padding: bezelWidth,
          boxShadow:
            "0 32px 80px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.12), inset 0 0 0 2px rgba(0, 0, 0, 0.8)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
        }}
      >
        {/* Screen Container */}
        <div
          style={{
            width: screenWidth,
            height,
            borderRadius: borderRadius - bezelWidth,
            overflow: "hidden",
            backgroundColor: "#000000",
            position: "relative",
          }}
        >
          {/* Offthread Video inside Freeze for exact frame mapping */}
          <Freeze frame={Math.max(0, currentVideoFrame)}>
            <OffthreadVideo
              src={staticFile(src.startsWith("clips/") ? src : `clips/${src}`)}
              muted
              style={{
                width: screenWidth,
                height,
                objectFit: "cover",
              }}
            />
          </Freeze>

          {/* Subtle Screen Glass Glare */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "40%",
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 60%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Camera Punchhole / Speaker Cutout */}
        <div
          style={{
            position: "absolute",
            top: 6,
            left: "50%",
            transform: "translateX(-50%)",
            width: 72,
            height: 4,
            borderRadius: 999,
            backgroundColor: "rgba(255, 255, 255, 0.18)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};
