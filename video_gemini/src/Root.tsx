import React from "react";
import { Composition } from "remotion";
import { GeminiLaunch } from "./GeminiLaunch";
import { InstagramStory, TOTAL_STORY_FRAMES } from "./story/InstagramStory";
import { FPS, HEIGHT, WIDTH } from "./theme";
import { getTotalFrames } from "./timeline";

export const Root: React.FC = () => {
  const totalFrames = getTotalFrames();

  return (
    <>
      {/* 16:9 Landscape Full Demo (1080p) */}
      <Composition
        id="GeminiLaunch"
        component={GeminiLaunch}
        durationInFrames={Math.max(1, totalFrames)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      {/* 9:16 Vertical Instagram Story / Reel (1080x1920) */}
      <Composition
        id="InstagramStory"
        component={InstagramStory}
        durationInFrames={TOTAL_STORY_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
