import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import { FPS } from "../theme";
import {
  StoryHook,
  StoryProblem,
  StoryDemoShare,
  StoryDemoBubble,
  StoryTeamCTA,
} from "./StoryScenes";

interface StorySceneDef {
  id: string;
  duration: number;
  lead: number;
  voDuration: number;
  Component: React.FC<{ duration: number; lead: number }>;
}

const STORY_SCENES: StorySceneDef[] = [
  { id: "st01-hook", duration: 125, lead: 10, voDuration: 105, Component: StoryHook },
  { id: "st02-problem", duration: 165, lead: 10, voDuration: 147, Component: StoryProblem },
  { id: "st03-demo-share", duration: 265, lead: 10, voDuration: 241, Component: StoryDemoShare },
  { id: "st04-demo-bubble", duration: 215, lead: 10, voDuration: 190, Component: StoryDemoBubble },
  { id: "st05-team-cta", duration: 420, lead: 10, voDuration: 342, Component: StoryTeamCTA },
];

export const TOTAL_STORY_FRAMES = STORY_SCENES.reduce((acc, s) => acc + s.duration, 0);

export const InstagramStory: React.FC = () => {
  let currentFrame = 0;

  const musicVolume = (frame: number) => {
    const fadeIn = interpolate(frame, [0, FPS], [0, 0.22], { extrapolateRight: "clamp" });
    const fadeOut = interpolate(
      frame,
      [TOTAL_STORY_FRAMES - FPS * 2, TOTAL_STORY_FRAMES],
      [0.22, 0],
      { extrapolateLeft: "clamp" }
    );
    return Math.min(fadeIn, fadeOut);
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#0F1117" }}>
      {/* Background Music Bed */}
      <Audio src={staticFile("music/bed.mp3")} volume={musicVolume} />

      {/* Render 5 Story Scenes */}
      {STORY_SCENES.map((sc) => {
        const from = currentFrame;
        currentFrame += sc.duration;
        const Component = sc.Component;

        return (
          <Sequence key={sc.id} from={from} durationInFrames={sc.duration} name={sc.id}>
            <Component duration={sc.duration} lead={sc.lead} />

            {/* Voiceover */}
            <Sequence from={sc.lead} durationInFrames={sc.voDuration + 10}>
              <Audio src={staticFile(`story_vo/${sc.id}.mp3`)} volume={1.0} />
            </Sequence>

            {/* Double Buzz Haptic SFX on Hoax Alert */}
            {sc.id === "st03-demo-share" && (
              <Sequence from={sc.lead + 181} durationInFrames={FPS * 1.5}>
                <Audio src={staticFile("sfx/buzz.wav")} volume={0.8} />
              </Sequence>
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
