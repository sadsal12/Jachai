import voManifest from "./vo_manifest.json";
import { FPS } from "./theme";

export interface SceneConfig {
  id: string;
  lead: number; // frames before voice starts
  tail: number; // frames after voice finishes
  minFrames?: number;
}

export const SCENE_CONFIGS: SceneConfig[] = [
  { id: "s01-crisis", lead: 12, tail: 20 },
  { id: "s02-stakes", lead: 12, tail: 20 },
  { id: "s03-intro", lead: 12, tail: 20 },
  { id: "s04-share-demo", lead: 12, tail: 25 },
  { id: "s05-text-check", lead: 12, tail: 20 },
  { id: "s06-vision-check", lead: 12, tail: 20 },
  { id: "s07-bubble-demo", lead: 12, tail: 20 },
  { id: "s08-privacy", lead: 12, tail: 20 },
  { id: "s09-business", lead: 12, tail: 20 },
  { id: "s10-team-cta", lead: 15, tail: 130 }, // generous tail for final CTA logo & URL hold
];

export interface ComputedScene extends SceneConfig {
  from: number;
  durationInFrames: number;
  voDurationFrames: number;
  audioPath: string;
}

export const computeTimeline = (): ComputedScene[] => {
  let currentFrame = 0;
  const manifest = voManifest as Record<string, { duration: number }>;

  return SCENE_CONFIGS.map((config) => {
    const voDurationSec = manifest[config.id]?.duration || 10;
    const voDurationFrames = Math.ceil(voDurationSec * FPS);
    const calculatedFrames = config.lead + voDurationFrames + config.tail;
    const durationInFrames = Math.max(calculatedFrames, config.minFrames || 0);

    const scene: ComputedScene = {
      ...config,
      from: currentFrame,
      durationInFrames,
      voDurationFrames,
      audioPath: `vo/${config.id}.mp3`,
    };

    currentFrame += durationInFrames;
    return scene;
  });
};

export const getTotalFrames = (): number => {
  const timeline = computeTimeline();
  if (timeline.length === 0) return 0;
  const last = timeline[timeline.length - 1];
  return last.from + last.durationInFrames;
};
