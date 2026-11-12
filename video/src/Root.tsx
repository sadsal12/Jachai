import React from "react";
import { Composition } from "remotion";
import { Launch, LaunchV2, totalV2 } from "./Launch";
import { Thumbnail } from "./Thumbnail";
import { totalFrames } from "./timeline";
import { FPS, H, W } from "./theme";

export const Root: React.FC = () => (
  <>
    <Composition id="Launch" component={Launch} durationInFrames={totalFrames()} fps={FPS} width={W} height={H} />
    {/* Citizen First cut, at most 3:00. */}
    <Composition id="LaunchV2" component={LaunchV2} durationInFrames={totalV2()} fps={FPS} width={W} height={H} />
    <Composition id="Thumbnail" component={Thumbnail} durationInFrames={1} fps={FPS} width={1280} height={720} />
  </>
);
