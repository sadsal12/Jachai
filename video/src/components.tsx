import React from "react";
import {
  AbsoluteFill, Freeze, OffthreadVideo, interpolate, interpolateColors, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { C, FONT } from "./theme";

/** Soft spring 0 -> 1 starting at `delay` frames. */
export const useIn = (delay = 0, damping = 18) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.8 } });
};

/** Text that rises and fades in. */
export const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay = 0, children, style,
}) => {
  const p = useIn(delay);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 28}px)`, ...style }}>{children}</div>
  );
};

/** Fades a whole scene out over its last `frames` frames. */
export const SceneFade: React.FC<{
  duration: number; children: React.ReactNode; bg?: string; brand?: boolean; fadeOut?: number; bgTo?: string;
}> = ({ duration, children, bg = C.paper, brand = true, fadeOut = 10, bgTo }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8, duration - fadeOut, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // Optional slow dissolve of the background into the next scene's colour (e.g. black -> white).
  const background = bgTo
    ? interpolateColors(frame, [duration - fadeOut * 0.6, duration], [bg, bgTo])
    : bg;
  return (
    <AbsoluteFill style={{ backgroundColor: background, fontFamily: FONT }}>
      <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
      {brand && <BrandBug />}
    </AbsoluteFill>
  );
};

/** Small, steady app mark in the bottom-left corner of the light scenes (doesn't fade between scenes). */
export const BrandBug: React.FC = () => (
  <div style={{ position: "absolute", left: 56, bottom: 40, display: "flex", alignItems: "center", gap: 14, opacity: 0.9 }}>
    <AppTile size={46} />
    <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8, color: C.ink }}>Jachai</div>
  </div>
);

/** Frames (scene time) when the phone shakes for the double buzz: two short pulses with a gap. */
const buzzAmount = (frame: number, at: number) => {
  const pulse = (a: number) => (frame >= a && frame < a + 10 ? Math.sin(((frame - a) / 10) * Math.PI) : 0);
  return pulse(at) + pulse(at + 15);
};

/**
 * A phone screen recording in a device frame, fading in with the scene. The clip shows its first frame until
 * `playAt` (scene frames), plays from `start` (clip seconds) at 1x, then holds its last frame. `buzzAt` adds a
 * subtle double shake with vibration marks, matching the app's "buzz twice" on a fake.
 */
export const Phone: React.FC<{
  src: string; start?: number; clipLength: number; height?: number; playAt?: number; buzzAt?: number;
}> = ({ src, start = 0, clipLength, height = 900, playAt = 0, buzzAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Clips are cropped to the phone's real 9:20 screen (864 x 1920).
  const width = (height * 864) / 1920;
  const lastFrame = Math.floor((clipLength - start) * fps) - 2;
  const clipFrame = Math.max(0, Math.min(frame - playAt, lastFrame));
  const appear = interpolate(frame, [2, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const buzz = buzzAt === undefined ? 0 : buzzAmount(frame, buzzAt);
  const shake = buzz * Math.sin(frame * 2.6) * 7;
  return (
    <div style={{
      position: "relative", opacity: appear,
      transform: `translateY(${(1 - appear) * 24}px) scale(${0.97 + appear * 0.03}) translateX(${shake}px) rotate(${shake * 0.12}deg)`,
    }}>
      {buzz > 0 && [-1, 1].map((side) => (
        <svg key={side} width={60} height={160} viewBox="0 0 60 160" style={{
          position: "absolute", top: height / 2 - 80, opacity: buzz * 0.8,
          [side < 0 ? "left" : "right"]: -78, transform: side < 0 ? "scaleX(-1)" : undefined,
        }}>
          <path d="M14 40 Q30 80 14 120" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
          <path d="M36 22 Q58 80 36 138" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        </svg>
      ))}
      <div style={{
        width: width + 28, height: height + 28, borderRadius: 64, background: "#0B0B0C", padding: 14,
        boxShadow: "0 40px 90px rgba(0,0,0,0.28), 0 0 0 2px #2A2A2D inset",
      }}>
        <div style={{ width, height, borderRadius: 50, overflow: "hidden", background: "#000" }}>
          <Freeze frame={clipFrame}>
            <OffthreadVideo src={staticFile(src)} startFrom={Math.round(start * fps)} muted style={{ width: "100%", height: "100%" }} />
          </Freeze>
        </div>
      </div>
    </div>
  );
};

/** Small caption pill used beside the phone in demo scenes. */
export const Callout: React.FC<{ at: number; until?: number; children: React.ReactNode; tone?: "ink" | "red" | "green" }> = ({
  at, until = 1e9, children, tone = "ink",
}) => {
  const frame = useCurrentFrame();
  const p = useIn(at);
  const out = interpolate(frame, [until, until + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < at - 1 || frame > until + 8) return null;
  const color = tone === "red" ? C.red : tone === "green" ? C.green : C.ink;
  return (
    <div style={{
      opacity: p * out, transform: `translateX(${(1 - p) * 24}px)`, fontSize: 46, fontWeight: 700, color,
      lineHeight: 1.2, marginBottom: 22, letterSpacing: -0.5,
    }}>{children}</div>
  );
};

/** The B3 app tile, drawn with the same geometry as design/app-kit. `float` lifts the dot out (0..1). */
export const AppTile: React.FC<{ size: number; float?: number; dotColor?: string; style?: React.CSSProperties }> = ({
  size, float = 1, dotColor = C.ink, style,
}) => {
  // float 0: a plain tile with a white dot over the j. float 1: the bite has opened and the dot sits in it.
  const cx = 140 + (186 - 140) * float, cy = 100 + (62 - 100) * float;
  const bite = 50 * Math.min(1, float * 1.2);
  const dot = float < 0.55 ? C.paper : dotColor;
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" style={style} overflow="visible">
      <defs><mask id="bite"><rect x="0" y="0" width="256" height="256" fill="#fff" /><circle cx={186} cy={62} r={bite} fill="#000" /></mask></defs>
      <rect x="16" y="16" width="224" height="224" rx="60" fill={C.ink} mask="url(#bite)" />
      <circle cx={cx} cy={cy} r={30} fill={dot} />
      <path d="M140,128V164A42,42 0 0,1 98,206H92" fill="none" stroke={C.paper} strokeWidth={36} strokeLinecap="round" />
    </svg>
  );
};
