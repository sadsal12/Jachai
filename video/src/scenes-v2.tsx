import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Rise, SceneFade, useIn } from "./components";
import { Cue, ProblemCues, Title } from "./scenes";
import { C, FPS } from "./theme";

// Scenes for the v2 "Citizen First" cut. Cue times are seconds into each scene's voice-over (from wordtimes.py).
type P = { duration: number; lead: number };
const s = (sec: number) => Math.round(sec * FPS);

const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <Rise delay={4} style={{ fontSize: 30, fontWeight: 700, color: C.muted, letterSpacing: 3, textTransform: "uppercase", ...style }}>
    {children}
  </Rise>
);

// ---------------------------------------------------------------- 2. problem (shorter voice line)
const PROBLEM: Cue[] = [
  { at: 0.1, until: 2.6, node: <Title size={104}>Rumours travel faster<br />than the truth.</Title> },
  { at: 2.8, until: 7.0, node: <Title>The people who get the most forwards<br /><span style={{ color: C.accent }}>are the least able to check them.</span></Title> },
  { at: 7.3, until: 11.2, node: <Title>With AI, a fake photo or video<br />takes <span style={{ color: C.accent }}>seconds</span> to make.</Title> },
  { at: 11.5, until: 99, node: <><Title size={64} color={C.muted} style={{ marginBottom: 18 }}>2019</Title><Title>A rumour just like this one led to<br /><span style={{ color: C.red }}>mob attacks on innocent people.</span></Title></> },
];
export const ProblemV2: React.FC<P> = (props) => <ProblemCues {...props} cues={PROBLEM} />;

// ---------------------------------------------------------------- 9. the check pipeline
const STEPS = [
  { at: 3.7, title: "Understand", sub: "text, photo, video or screen" },
  { at: 5.2, title: "Read", sub: "OCR · Bangla + English" },
  { at: 7.8, title: "Retrieve", sub: "closest known hoax from a curated library" },
  { at: 11.6, title: "Score", sub: "vision model for photos + video frames" },
  { at: 14.0, title: "Explain", sub: "plain verdict, bn + en, with the matched fact" },
];

export const PipelineV2: React.FC<P> = ({ duration, lead }) => {
  const frame = useCurrentFrame();
  const W = 300, GAP = 44, X0 = (1920 - (STEPS.length * W + (STEPS.length - 1) * GAP)) / 2, Y = 470;
  return (
    <SceneFade duration={duration} bg={C.soft}>
      <Label style={{ position: "absolute", left: 120, top: 90 }}>How it works</Label>
      <Rise delay={lead + 2} style={{ position: "absolute", left: 120, top: 150 }}>
        <Title size={72}>A multi-step check pipeline.</Title>
      </Rise>
      {STEPS.map((st, i) => {
        const p = useInAt(st.at, lead);
        const x = X0 + i * (W + GAP);
        const last = i === STEPS.length - 1;
        return (
          <React.Fragment key={st.title}>
            {i > 0 && (
              <div style={{
                position: "absolute", left: x - GAP + 6, top: Y + 78, width: GAP - 12, height: 5, borderRadius: 3,
                background: C.accent, transformOrigin: "left", transform: `scaleX(${p})`,
              }} />
            )}
            <div style={{
              position: "absolute", left: x, top: Y, width: W, minHeight: 190, padding: "28px 28px", borderRadius: 28,
              background: last ? C.ink : C.paper, border: last ? "none" : "2px solid #E3E3E0", opacity: p,
              transform: `translateY(${(1 - p) * 24}px)`, boxShadow: "0 18px 40px rgba(0,0,0,0.06)",
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: last ? "#BDBDBD" : C.accent, letterSpacing: 2 }}>STEP {i + 1}</div>
              <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1, marginTop: 8, color: last ? C.paper : C.ink }}>{st.title}</div>
              <div style={{ fontSize: 24, lineHeight: 1.3, marginTop: 10, color: last ? "#BDBDBD" : C.muted }}>{st.sub}</div>
            </div>
          </React.Fragment>
        );
      })}
      <div style={{
        position: "absolute", left: X0, top: Y + 270, width: STEPS.length * W + (STEPS.length - 1) * GAP, padding: "22px 30px",
        borderRadius: 24, border: `3px dashed ${C.muted}`, fontSize: 30, color: C.ink, fontWeight: 600,
        opacity: interpolate(frame, [lead + s(15.9), lead + s(16.5)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        Fallback · if a model is slow, Jachai still answers honestly, and says when it isn’t sure.
      </div>
    </SceneFade>
  );
};

/** useIn at a voice-over time (seconds) inside a scene. */
const useInAt = (sec: number, lead: number) => useIn(lead + s(sec));

// ---------------------------------------------------------------- 10. built for Citizen First
const FIT = [
  { at: 2.5, title: "One assistant, Bangla + English", sub: "multilingual citizen service, made for older users" },
  { at: 4.8, title: "Answers grounded in checked facts", sub: "retrieval over a curated library of known hoaxes" },
  { at: 7.0, title: "A pipeline that works for you", sub: "share menu · in-app checks · floating bubble" },
  { at: 9.9, title: "Privacy by design", sub: "no account · no identity needed · nothing kept after the check" },
];

const Tick: React.FC = () => (
  <svg width={44} height={44} viewBox="0 0 44 44">
    <circle cx={22} cy={22} r={22} fill={C.accent} />
    <path d="M12 23 L19 30 L32 15" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CitizenFirst: React.FC<P> = ({ duration, lead }) => (
  <SceneFade duration={duration}>
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 220px" }}>
      <Label style={{ marginBottom: 18 }}>CivicSphere AI · Citizen First</Label>
      <Rise delay={lead + 2} style={{ marginBottom: 56 }}><Title size={76}>Built for Citizen First.</Title></Rise>
      {FIT.map((f) => <FitRow key={f.title} at={lead + s(f.at)} title={f.title} sub={f.sub} />)}
    </AbsoluteFill>
  </SceneFade>
);

const FitRow: React.FC<{ at: number; title: string; sub: string }> = ({ at, title, sub }) => {
  const p = useIn(at);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 30, marginBottom: 30, opacity: p, transform: `translateX(${(1 - p) * 24}px)` }}>
      <Tick />
      <div>
        <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: -0.8, color: C.ink }}>{title}</div>
        <div style={{ fontSize: 28, color: C.muted, marginTop: 4 }}>{sub}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- 11. business (Bangladesh pricing)
const Plan: React.FC<{ at: number; name: string; price: string; per?: string; lines: string[]; dark?: boolean; tag?: string }> = ({
  at, name, price, per, lines, dark, tag,
}) => {
  const p = useIn(at);
  return (
    <div style={{
      flex: 1, borderRadius: 36, padding: "44px 48px", background: dark ? C.ink : C.paper, color: dark ? C.paper : C.ink,
      opacity: p, transform: `translateY(${(1 - p) * 30}px)`, boxShadow: "0 24px 60px rgba(0,0,0,0.08)", position: "relative",
    }}>
      {tag && <div style={{
        position: "absolute", top: 28, right: 32, fontSize: 22, fontWeight: 700, padding: "6px 16px", borderRadius: 99,
        background: C.accent, color: C.ink,
      }}>{tag}</div>}
      <div style={{ fontSize: 30, fontWeight: 600, opacity: 0.7 }}>{name}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "12px 0 16px" }}>
        <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: -3 }}>{price}</div>
        {per && <div style={{ fontSize: 32, opacity: 0.7 }}>{per}</div>}
      </div>
      {lines.map((l) => <div key={l} style={{ fontSize: 28, opacity: 0.85, marginTop: 6 }}>{l}</div>)}
    </div>
  );
};

export const BusinessV2: React.FC<P> = ({ duration, lead }) => (
  <SceneFade duration={duration} bg={C.soft}>
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 140px" }}>
      <Label style={{ marginBottom: 40 }}>Business model · Bangladesh launch pricing</Label>
      <div style={{ display: "flex", gap: 36 }}>
        <Plan at={lead + s(0.2)} name="Core app" price="Free" lines={["5 checks a day", "For everyone"]} />
        <Plan at={lead + s(3.2)} dark name="Family" price="৳149" per="/ month" tag="Best value"
          lines={["or ৳1,200 / year", "Unlimited checks, up to 4 phones"]} />
        <Plan at={lead + s(10.0)} name="Guardian" price="৳250" per="/ month"
          lines={["Everything in Family", "+ alerts for the family (planned)"]} />
      </div>
      <Rise delay={lead + s(14.7)} style={{ marginTop: 44, fontSize: 38, fontWeight: 600, color: C.ink }}>
        Next: bundles with <span style={{ color: C.accent }}>telecom operators and mobile wallets</span> (bKash, Nagad).
      </Rise>
    </AbsoluteFill>
  </SceneFade>
);
