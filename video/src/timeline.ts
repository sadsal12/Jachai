import durationsV1 from "./durations.json";
import specsV1 from "./specs-v1.json";

// Each scene lasts its voice-over plus a little air; demo scenes can ask for a minimum length (frames) to fit their
// clip. Scene specs live in specs-*.json so captions.py reads exactly the same timing.
export type SceneSpec = { id: string; lead: number; tail: number; min?: number };
export type Durations = Record<string, number>;
const FPS = 30;

export const buildTimeline = (specs: SceneSpec[], durations: Durations) => {
  let at = 0;
  return specs.map((s) => {
    const voFrames = Math.ceil(durations[s.id] * FPS);
    const frames = Math.max(s.min ?? 0, s.lead + voFrames + s.tail);
    const from = at;
    at += frames;
    return { ...s, from, frames, voFrames };
  });
};

export const totalOf = (specs: SceneSpec[], durations: Durations) =>
  buildTimeline(specs, durations).reduce((n, s) => n + s.frames, 0);

// v1 (the original 3:15 cut)
export const timeline = () => buildTimeline(specsV1, durationsV1);
export const totalFrames = () => totalOf(specsV1, durationsV1);
