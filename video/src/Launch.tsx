import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import {
  A_HOLD, A_RED, A_START, Bubble, Business, ColdOpen, Different, Everyone, HowItWorks, MediaCheck, Problem, Responsible,
  Reveal, Team, TextCheck, WhatsApp,
} from "./scenes";
import { BusinessV2, CitizenFirst, PipelineV2, ProblemV2 } from "./scenes-v2";
import durationsV1 from "./durations.json";
import durationsV2 from "./durations-v2.json";
import specsV1 from "./specs-v1.json";
import specsV2 from "./specs-v2.json";
import { Durations, SceneSpec, buildTimeline } from "./timeline";
import { C, FPS } from "./theme";

type SceneComponent = React.FC<{ duration: number; lead: number }>;

const V1: Record<string, SceneComponent> = {
  "s01-cold-open": ColdOpen, "s02-problem": Problem, "s03-reveal": Reveal, "s04-whatsapp": WhatsApp,
  "s05-text": TextCheck, "s06-media": MediaCheck, "s07-bubble": Bubble, "s07b-different": Different, "s08-everyone": Everyone,
  "s09-how": HowItWorks, "s10-responsible": Responsible, "s11-business": Business, "s12-team": Team,
};

// v2: Citizen First edition, at most 3:00. Demo scenes are shared with v1.
const V2: Record<string, SceneComponent> = {
  "s01-cold-open": ColdOpen, "s02-problem": ProblemV2, "s03-reveal": Reveal, "s04-whatsapp": WhatsApp,
  "s05-text": TextCheck, "s06-media": MediaCheck, "s07-bubble": Bubble, "s08-everyone": Everyone,
  "s09-pipeline": PipelineV2, "s10-citizen": CitizenFirst, "s11-business": BusinessV2, "s12-team": Team,
};

const Film: React.FC<{ specs: SceneSpec[]; durations: Durations; scenes: Record<string, SceneComponent>; vo: string }> = ({
  specs, durations, scenes: components, vo,
}) => {
  const scenes = buildTimeline(specs, durations);
  const total = scenes.reduce((n, s) => n + s.frames, 0);
  const voiceWindows = scenes.map((sc) => [sc.from + sc.lead, sc.from + sc.lead + sc.voFrames]);
  // Music sits low under the voice and lifts in the gaps and at the end.
  const musicVolume = (f: number) => {
    const speaking = voiceWindows.some(([a, b]) => f >= a - 6 && f <= b + 6);
    const base = speaking ? 0.12 : 0.3;
    const fadeIn = interpolate(f, [0, FPS], [0, 1], { extrapolateRight: "clamp" });
    const fadeOut = interpolate(f, [total - 3 * FPS, total], [1, 0], { extrapolateLeft: "clamp" });
    return base * fadeIn * fadeOut;
  };
  const whatsapp = scenes.find((sc) => sc.id === "s04-whatsapp")!;
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <Audio src={staticFile("music/bed.mp3")} volume={musicVolume} />
      {scenes.map((sc) => {
        const Scene = components[sc.id];
        return (
          <Sequence key={sc.id} from={sc.from} durationInFrames={sc.frames} name={sc.id}>
            <Scene duration={sc.frames} lead={sc.lead} />
            <Sequence from={sc.lead}><Audio src={staticFile(`${vo}/${sc.id}.mp3`)} /></Sequence>
          </Sequence>
        );
      })}
      {/* The phone's double buzz, on the same frame as the phone shake in the WhatsApp demo. */}
      <Sequence from={whatsapp.from + whatsapp.lead + Math.round((A_HOLD + A_RED - A_START) * FPS)} durationInFrames={FPS}>
        <Audio src={staticFile("sfx/buzz.wav")} volume={0.5} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Launch: React.FC = () => <Film specs={specsV1} durations={durationsV1} scenes={V1} vo="vo" />;
export const LaunchV2: React.FC = () => <Film specs={specsV2} durations={durationsV2} scenes={V2} vo="vo-v2" />;
export const totalV2 = () => buildTimeline(specsV2, durationsV2).reduce((n, s) => n + s.frames, 0);
