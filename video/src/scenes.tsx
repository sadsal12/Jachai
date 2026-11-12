import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AppTile, Callout, Phone, Rise, SceneFade, useIn } from "./components";
import { BANGLA, C, FONT, FPS } from "./theme";

type P = { duration: number; lead: number };
const s = (sec: number) => Math.round(sec * FPS);

export const Title: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({
  children, size = 84, color = C.ink, style,
}) => (
  <div style={{ fontSize: size, fontWeight: 800, letterSpacing: -2, lineHeight: 1.08, color, ...style }}>{children}</div>
);

// ---------------------------------------------------------------- 1. cold open
const GROUPS = [
  // Clear of the 860 px message card (x 530-1390) on both sides.
  { name: "Family", x: 80, y: 230 }, { name: "Cousins", x: 110, y: 470 }, { name: "Neighbours", x: 70, y: 710 },
  { name: "Office", x: 1460, y: 250 }, { name: "School friends", x: 1440, y: 490 }, { name: "Building committee", x: 1470, y: 730 },
];

/** A group chat the rumour lands in: dim at first, lights up with "Forwarded" once the thumb taps. */
const GroupChip: React.FC<{ name: string; x: number; y: number; at: number }> = ({ name, x, y, at }) => {
  const frame = useCurrentFrame();
  const seen = useIn(s(1.0) + (x > 900 ? 6 : 0) + Math.round(y / 40));
  const hit = useIn(at);  // 0 until the tap lands
  const pop = 1 + 0.05 * Math.max(0, 1 - Math.abs(frame - at - 6) / 8);
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: 380, display: "flex", alignItems: "center", gap: 18,
      padding: "18px 22px", borderRadius: 22, background: hit > 0.5 ? "#1F2C33" : "#16191C",
      opacity: 0.2 + seen * 0.35 + hit * 0.45, transform: `scale(${pop})`,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 99, background: "#2A3942", color: "#8696A0", display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700,
      }}>{name[0]}</div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 600, color: "#E9EDEF" }}>{name}</div>
        <div style={{ fontSize: 22, color: hit > 0.5 ? "#53BDEB" : "#8696A0", fontStyle: "italic" }}>
          {hit > 0.5 ? "↪ Forwarded ✓✓" : "online"}
        </div>
      </div>
    </div>
  );
};

export const ColdOpen: React.FC<P> = ({ duration }) => {
  const frame = useCurrentFrame();
  const card = useIn(8);
  const tap = interpolate(frame, [s(5.0), s(6.0)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = 1 + 0.06 * Math.sin(frame / 5);
  return (
    <SceneFade duration={duration} bg={C.night} brand={false} fadeOut={40} bgTo={C.paper}>
      {GROUPS.map((g, i) => <GroupChip key={g.name} {...g} at={s(6.1) + i * 7} />)}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${1 + frame / 6000})` }}>
        <div style={{
          width: 860, background: "#1F2C33", borderRadius: 28, padding: "34px 40px", color: "#E9EDEF",
          opacity: card, transform: `translateY(${(1 - card) * 40}px)`, boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontSize: 26, color: "#8696A0", fontStyle: "italic", marginBottom: 14 }}>↪ Forwarded many times</div>
          <div style={{ fontSize: 44, lineHeight: 1.35, fontWeight: 500 }}>
            <b>URGENT!!</b> Please share with everyone. Child kidnappers are going around collecting children's
            heads because the Padma Bridge construction needs human heads…
          </div>
        </div>
        <div style={{
          marginTop: 56, display: "flex", alignItems: "center", gap: 18, padding: "22px 48px", borderRadius: 999,
          background: "#25D366", color: C.night, fontSize: 40, fontWeight: 700, opacity: useIn(s(2.4)),
          transform: `scale(${tap > 0 && tap < 1 ? 0.94 : pulse})`,
        }}>Forward ➜</div>
        <div style={{
          position: "absolute", width: 90, height: 90, borderRadius: 999, border: "4px solid rgba(255,255,255,0.8)",
          top: 760 - (1 - tap) * 260, left: 1010 + (1 - tap) * 300, opacity: frame > s(4.4) ? 1 - tap * 0.4 : 0,
        }} />
      </AbsoluteFill>
    </SceneFade>
  );
};

// ---------------------------------------------------------------- 2. problem
export type Cue = { at: number; until: number; node: React.ReactNode };

const lines: Cue[] = [
  { at: 0.3, until: 5.6, node: <Title size={104}>Rumours travel faster<br />than the truth.</Title> },
  { at: 5.9, until: 11.4, node: <Title>The people who get the most forwards<br /><span style={{ color: C.accent }}>are the least able to check them.</span></Title> },
  { at: 11.7, until: 16.4, node: <Title>With AI, a fake photo or video<br />takes <span style={{ color: C.accent }}>seconds</span> to make.</Title> },
  { at: 16.7, until: 99, node: <><Title size={64} color={C.muted} style={{ marginBottom: 18 }}>2019</Title><Title>A rumour just like this one led to<br /><span style={{ color: C.red }}>mob attacks on innocent people.</span></Title></> },
];

export const Problem: React.FC<P> = (props) => <ProblemCues {...props} cues={lines} />;

/** Statement cards that rise in and fade out at given voice-over times (seconds). */
export const ProblemCues: React.FC<P & { cues: Cue[] }> = ({ duration, lead, cues }) => {
  const frame = useCurrentFrame();
  return (
    <SceneFade duration={duration}>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 180px" }}>
        {cues.map((l, i) => {
          const a = lead + s(l.at), b = lead + s(l.until);
          if (frame < a - 2 || frame > b + 10) return null;
          const out = interpolate(frame, [b, b + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return <div key={i} style={{ position: "absolute", left: 180, right: 180, opacity: out }}><Rise delay={a}>{l.node}</Rise></div>;
        })}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ---------------------------------------------------------------- 3. reveal
export const Reveal: React.FC<P> = ({ duration, lead }) => {
  const frame = useCurrentFrame();
  const tile = useIn(4, 14);
  const float = interpolate(frame, [s(0.6), s(1.6)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const word = useIn(s(1.4));
  return (
    <SceneFade duration={duration} brand={false}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 56 }}>
          <div style={{ transform: `scale(${0.6 + tile * 0.4})`, opacity: tile }}><AppTile size={300} float={float} /></div>
          <div style={{ opacity: word, transform: `translateX(${(1 - word) * -30}px)` }}>
            <Title size={170} style={{ letterSpacing: -6 }}>Jachai</Title>
            <div style={{ fontSize: 50, color: C.muted, marginTop: 8, lineHeight: 1.6 }}>
              <span style={{ fontFamily: BANGLA, fontWeight: 700, color: C.ink, display: "inline-block", lineHeight: 1.6, padding: "6px 0" }}>যাচাই</span> · verify
            </div>
          </div>
        </div>
        <Rise delay={lead + s(2.6)} style={{ marginTop: 90, fontSize: 56, fontWeight: 600, color: C.ink }}>
          Check it before you forward it.
        </Rise>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ---------------------------------------------------------------- demo layout
const Demo: React.FC<{
  duration: number; lead: number; phoneLeft?: boolean; label: string; phone: React.ReactNode; children: React.ReactNode;
  note?: string;
}> = ({ duration, lead, phoneLeft = true, label, phone, children, note }) => (
  <SceneFade duration={duration} bg={C.soft}>
    {/* Phone and caption column are centred as a group (either side), so there's no big empty gap between them
        and nothing hugs the edges or the brand mark. */}
    <AbsoluteFill style={{
      flexDirection: phoneLeft ? "row" : "row-reverse", alignItems: "center", padding: "0 170px", gap: 150,
      justifyContent: "center",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        {phone}
        {note && <div style={{ fontSize: 24, color: C.muted }}>{note}</div>}
      </div>
      <div style={{ width: 860, flex: "none" }}>
        <Rise delay={4} style={{ fontSize: 30, fontWeight: 700, color: C.muted, letterSpacing: 3, textTransform: "uppercase", marginBottom: 34 }}>
          {label}
        </Rise>
        {children}
      </div>
    </AbsoluteFill>
  </SceneFade>
);

// ---------------------------------------------------------------- 4. WhatsApp share (clip A)
export const A_START = 2.25;  // clip seconds playing when the voice starts: Share tap on "Tap", red screen on "Known hoax"
export const A_HOLD = 0;
export const A_RED = 10.2;  // clip time when the red verdict lands (measured)
const at = (lead: number, clipT: number) => lead + s(A_HOLD + clipT - A_START);

export const WhatsApp: React.FC<P> = ({ duration, lead }) => (
  <Demo duration={duration} lead={lead} label="Share sheet · WhatsApp" phone={
    <Phone src="clips/A-whatsapp-take1.mp4" start={A_START} clipLength={15.6} height={860}
      playAt={lead + s(A_HOLD)} buzzAt={at(lead, A_RED)} />
  }>
    <Callout at={at(lead, 4.7)}>Share → <span style={{ color: C.accent }}>Jachai</span></Callout>
    <Callout at={at(lead, A_RED)} tone="red">Known hoax · Very sure</Callout>
    <Callout at={at(lead, 14.3)}>“Don’t forward this.”</Callout>
    <Callout at={at(lead, 15.85)}>Double buzz, so no one misses it.</Callout>
  </Demo>
);

// ---------------------------------------------------------------- 5. Check a Text (clip C, pending)
export const TextCheck: React.FC<P> = ({ duration, lead }) => (
  <Demo duration={duration} lead={lead} phoneLeft={false} label="Check a Text" phone={<Phone src="clips/C-text-take1.mp4" start={0.8} clipLength={10.17} height={860} playAt={lead + s(0.5)} />}>
    <Callout at={lead + s(1.4)}>Paste. Tap <span style={{ color: C.accent }}>Check</span>.</Callout>
    <Callout at={lead + s(5.2)}>Plain Bangla and English.</Callout>
    <Callout at={lead + s(7.2)}>How sure it is, in words.</Callout>
    <Callout at={lead + s(9.6)} tone="green">Honest when it isn’t sure.</Callout>
  </Demo>
);

// ---------------------------------------------------------------- 6. Photos and videos (clip D, pending)
export const MediaCheck: React.FC<P> = ({ duration, lead }) => (
  <Demo duration={duration} lead={lead} label="Photos and videos" phone={<Phone src="clips/D-photo-take1.mp4" start={1.5} clipLength={11.4} height={860} playAt={lead} />}>
    <Callout at={lead + s(0.6)}>Choose a photo or video.</Callout>
    <Callout at={lead + s(6.4)} tone="red">AI-generated · Very sure</Callout>
    <Callout at={lead + s(8.4)}>Reads text in screenshots, too.</Callout>
    <div style={{ fontSize: 26, color: C.muted, marginTop: 10 }}>Vision model: Ateeqq/ai-vs-human-image-detector</div>
  </Demo>
);

// ---------------------------------------------------------------- 7. bubble (clip B)
const B_START = 4.2;
const bt = (lead: number, clipT: number) => lead + s(clipT - B_START);

export const Bubble: React.FC<P> = ({ duration, lead }) => (
  <Demo duration={duration} lead={lead} phoneLeft={false} label="Floating bubble" note="Bubble shown with a rehearsed post" phone={
    <Phone src="clips/B-bubble-take1.mp4" start={B_START} clipLength={12.6} height={820} playAt={lead + s(0.5)} />
  }>
    <Callout at={lead + s(0.3)}>Use your phone as usual.</Callout>
    <Callout at={bt(lead, 7.6)}>Something feels off? <span style={{ color: C.accent }}>Tap the bubble.</span></Callout>
    <Callout at={bt(lead, 10.4)} tone="red">Checked, right where you are.</Callout>
  </Demo>
);

// ---------------------------------------------------------------- 7b. why it's different
export const Different: React.FC<P> = ({ duration, lead }) => {
  const frame = useCurrentFrame();
  const swap = lead + s(3.6);
  const first = interpolate(frame, [swap, swap + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <SceneFade duration={duration}>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 200px" }}>
        <div style={{ position: "absolute", left: 200, right: 200, opacity: first }}>
          <Rise delay={lead}><Title size={92} color={C.muted}>Fact-check sites only help<br />if you go looking.</Title></Rise>
        </div>
        {frame > swap && (
          <div style={{ position: "absolute", left: 200, right: 200 }}>
            <Rise delay={swap + 6}><Title size={92}>Jachai lives where<br />rumours <span style={{ color: C.accent }}>actually spread.</span></Title></Rise>
            <Rise delay={lead + s(6.6)} style={{ fontSize: 44, fontWeight: 600, color: C.muted, marginTop: 34 }}>
              In the share menu · On top of every app
            </Rise>
          </div>
        )}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ---------------------------------------------------------------- 8. made for everyone (clip E, pending)
export const Everyone: React.FC<P> = ({ duration, lead }) => (
  <Demo duration={duration} lead={lead} label="Made for everyone" phone={<Phone src="clips/E-settings-take1.mp4" start={3.0} clipLength={13.83} height={860} playAt={lead + s(0.7)} />}>
    <Callout at={lead + s(2.0)}>Large text, big buttons.</Callout>
    <Callout at={lead + s(3.8)}>Light and dark.</Callout>
    <Callout at={lead + s(6.0)}><span style={{ fontFamily: BANGLA, display: "inline-block", lineHeight: 1.6 }}>বাংলা</span> and English.</Callout>
  </Demo>
);

// ---------------------------------------------------------------- 9. how it works
const Node: React.FC<{ at: number; title: string; sub?: string; x: number; y: number; w?: number; tone?: string; dashed?: boolean }> = ({
  at, title, sub, x, y, w = 360, tone = C.paper, dashed,
}) => {
  const p = useIn(at);
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: w, padding: "26px 30px", borderRadius: 28, background: tone,
      border: dashed ? `3px dashed ${C.muted}` : `2px solid #E3E3E0`, opacity: p, transform: `scale(${0.9 + p * 0.1})`,
      boxShadow: dashed ? "none" : "0 18px 40px rgba(0,0,0,0.06)",
    }}>
      <div style={{ fontSize: 36, fontWeight: 700, color: tone === C.ink ? C.paper : C.ink }}>{title}</div>
      {sub && <div style={{ fontSize: 24, color: tone === C.ink ? "#BDBDBD" : C.muted, marginTop: 8 }}>{sub}</div>}
    </div>
  );
};

const Wire: React.FC<{ at: number; d: string }> = ({ at, d }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <path d={d} fill="none" stroke={C.accent} strokeWidth={5} strokeLinecap="round" pathLength={1}
    strokeDasharray="1" strokeDashoffset={1 - p} />;
};

export const HowItWorks: React.FC<P> = ({ duration, lead }) => {
  const t = (sec: number) => lead + s(sec);
  return (
    <SceneFade duration={duration} bg={C.soft}>
      <Rise delay={4} style={{ position: "absolute", left: 120, top: 80, fontSize: 30, fontWeight: 700, color: C.muted, letterSpacing: 3, textTransform: "uppercase" }}>
        How it works
      </Rise>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Wire at={t(2.6)} d="M 470 560 C 560 560 560 330 650 330" />
        <Wire at={t(5.4)} d="M 1010 330 L 1130 330" />
        <Wire at={t(10.0)} d="M 470 560 C 560 560 560 640 650 640" />
        <Wire at={t(5.4)} d="M 1490 330 C 1560 330 1560 520 1600 520" />
        <Wire at={t(10.0)} d="M 1010 640 C 1300 640 1500 560 1600 560" />
        <Wire at={t(14.0)} d="M 1010 850 C 1300 850 1500 600 1600 600" />
      </svg>
      <Node at={t(0.4)} x={110} y={480} w={360} title="Share · Paste · Bubble" sub="text, photo, video, screen" />
      <Node at={t(2.6)} x={650} y={260} title="OCR" sub="Tesseract · Bangla + English" />
      <Node at={t(5.4)} x={1130} y={260} title="Hoax matcher" sub="curated library of known hoaxes" />
      <Node at={t(10.0)} x={650} y={570} title="Vision model" sub="AI-image classifier, photos + frames" />
      <Node at={t(14.0)} x={650} y={780} title="Fallback" sub="always returns an honest answer" dashed />
      <Node at={t(16.5)} x={1600} y={470} w={250} tone={C.ink} title="Verdict" sub="bn + en" />
    </SceneFade>
  );
};

// ---------------------------------------------------------------- 10. responsible AI
const Point: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const p = useIn(at);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28, opacity: p, transform: `translateY(${(1 - p) * 20}px)`, marginBottom: 34 }}>
      <div style={{ width: 22, height: 22, borderRadius: 99, background: C.accent }} />
      <div style={{ fontSize: 62, fontWeight: 700, color: C.ink, letterSpacing: -1 }}>{children}</div>
    </div>
  );
};

export const Responsible: React.FC<P> = ({ duration, lead }) => (
  <SceneFade duration={duration}>
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 220px" }}>
      <Rise delay={4} style={{ fontSize: 30, fontWeight: 700, color: C.muted, letterSpacing: 3, textTransform: "uppercase", marginBottom: 50 }}>
        Responsible by design
      </Rise>
      <Point at={lead + s(0.2)}>No account needed.</Point>
      <Point at={lead + s(1.3)}>No uploads kept after the check.</Point>
      <Point at={lead + s(3.3)}>Your history stays on your phone.</Point>
      <Point at={lead + s(5.4)}>Honest when it isn’t sure.</Point>
    </AbsoluteFill>
  </SceneFade>
);

// ---------------------------------------------------------------- 11. business and scale
const Card: React.FC<{ at: number; title: string; big: string; sub: string; dark?: boolean }> = ({ at, title, big, sub, dark }) => {
  const p = useIn(at);
  return (
    <div style={{
      flex: 1, borderRadius: 36, padding: "48px 52px", background: dark ? C.ink : C.paper, color: dark ? C.paper : C.ink,
      opacity: p, transform: `translateY(${(1 - p) * 30}px)`, boxShadow: "0 24px 60px rgba(0,0,0,0.08)",
    }}>
      <div style={{ fontSize: 30, fontWeight: 600, opacity: 0.7 }}>{title}</div>
      <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -3, margin: "12px 0" }}>{big}</div>
      <div style={{ fontSize: 30, opacity: 0.8 }}>{sub}</div>
    </div>
  );
};

export const Business: React.FC<P> = ({ duration, lead }) => (
  <SceneFade duration={duration} bg={C.soft}>
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 160px" }}>
      <div style={{ display: "flex", gap: 40 }}>
        <Card at={lead + s(0.2)} title="Core app" big="Free" sub="Up to 5 checks a day." />
        <Card at={lead + s(3.7)} dark title="Family plan" big="৳150/mo" sub="Unlimited checks · mobile or bKash billing." />
      </div>
      <div style={{ display: "flex", gap: 40, marginTop: 40 }}>
        <Card at={lead + s(11.5)} title="Works on" big="Any phone" sub="Android or iOS, even older budget phones." />
        <Card at={lead + s(17.3)} title="Grow" big="Fact-checkers" sub="Here and abroad." />
      </div>
      <Rise delay={lead + s(21.5)} style={{ marginTop: 44, fontSize: 40, fontWeight: 600, color: C.ink }}>
        Next: <span style={{ color: C.accent }}>telecom and fact-checker partnerships.</span>
      </Rise>
    </AbsoluteFill>
  </SceneFade>
);

// ---------------------------------------------------------------- 12. team + call to action
const TEAM: { name: string; role: string; photo?: string; focus?: string }[] = [
  { name: "Rumman", role: "Product Manager & Frontend Lead" }, { name: "Saleh", role: "Backend & Systems Architect" },
  { name: "Anika", role: "AI Research & Documentation" }, { name: "Sami", photo: "sami2", role: "UI/UX Designer", focus: "50% 22%" },
  { name: "Mirazul", role: "QA & Field Testing" }, { name: "Sami", role: "Strategy & Pitch Development" },
];

export const Team: React.FC<P> = ({ duration, lead }) => {
  const frame = useCurrentFrame();
  const swap = s(7.0) + lead;  // after all six names are read out
  const teamOut = interpolate(frame, [swap, swap + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cta = useIn(swap + 6);
  return (
    <SceneFade duration={duration} brand={false}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: teamOut }}>
        <Rise delay={4} style={{ fontSize: 30, fontWeight: 700, color: C.muted, letterSpacing: 3, textTransform: "uppercase", marginBottom: 60 }}>
          Team Jachai
        </Rise>
        <div style={{ display: "flex", gap: 40 }}>
          {TEAM.map((m, i) => (
            <Rise key={m.photo ?? m.name} delay={8 + i * 4} style={{ textAlign: "center", width: 230 }}>
              <Img src={staticFile(`team/${m.photo ?? m.name.toLowerCase()}.jpg`)} style={{ width: 190, height: 190, borderRadius: 999, objectFit: "cover", objectPosition: m.focus ?? "50% 50%", background: C.soft }} />
              <div style={{ fontSize: 34, fontWeight: 700, marginTop: 20, color: C.ink }}>{m.name}</div>
              <div style={{ fontSize: 22, color: C.muted, marginTop: 6, lineHeight: 1.3 }}>{m.role}</div>
            </Rise>
          ))}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: cta }}>
        <AppTile size={220} />
        <Title size={120} style={{ marginTop: 36, letterSpacing: -4 }}>Jachai</Title>
        <div style={{ fontSize: 48, fontWeight: 600, marginTop: 14, color: C.ink }}>Check it before you forward it.</div>
        <div style={{ fontSize: 32, marginTop: 40, color: C.muted }}>github.com/sadsal12/Jachai</div>
      </AbsoluteFill>
    </SceneFade>
  );
};
