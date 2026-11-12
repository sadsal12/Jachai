import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import { C, FPS } from "./theme";
import { computeTimeline, getTotalFrames } from "./timeline";

// Scenes
import { Scene01Crisis } from "./scenes/Scene01Crisis";
import { Scene02Stakes } from "./scenes/Scene02Stakes";
import { Scene03Intro } from "./scenes/Scene03Intro";
import { Scene04ShareDemo } from "./scenes/Scene04ShareDemo";
import { Scene05TextCheck } from "./scenes/Scene05TextCheck";
import { Scene06VisionCheck } from "./scenes/Scene06VisionCheck";
import { Scene07BubbleDemo } from "./scenes/Scene07BubbleDemo";
import { Scene08PrivacyArch } from "./scenes/Scene08PrivacyArch";
import { Scene09CivicPlan } from "./scenes/Scene09CivicPlan";
import { Scene10TeamCTA } from "./scenes/Scene10TeamCTA";

const SCENE_COMPONENTS: Record<string, React.FC<{ duration: number; lead: number }>> = {
  "s01-crisis": Scene01Crisis,
  "s02-stakes": Scene02Stakes,
  "s03-intro": Scene03Intro,
  "s04-share-demo": Scene04ShareDemo,
  "s05-text-check": Scene05TextCheck,
  "s06-vision-check": Scene06VisionCheck,
  "s07-bubble-demo": Scene07BubbleDemo,
  "s08-privacy": Scene08PrivacyArch,
  "s09-business": Scene09CivicPlan,
  "s10-team-cta": Scene10TeamCTA,
};

export const GeminiLaunch: React.FC = () => {
  const scenes = computeTimeline();
  const totalFrames = getTotalFrames();

  // Active voiceover windows for dynamic music ducking
  const voiceWindows = scenes.map((s) => [
    s.from + s.lead,
    s.from + s.lead + s.voDurationFrames,
  ]);

  const musicVolume = (frame: number) => {
    const isSpeaking = voiceWindows.some(([a, b]) => frame >= a - 6 && frame <= b + 6);
    const targetVolume = isSpeaking ? 0.08 : 0.20;
    const fadeIn = interpolate(frame, [0, FPS * 1.5], [0, 1], { extrapolateRight: "clamp" });
    const fadeOut = interpolate(
      frame,
      [totalFrames - FPS * 3, totalFrames],
      [1, 0],
      { extrapolateLeft: "clamp" }
    );
    return targetVolume * fadeIn * fadeOut;
  };

  const shareDemoScene = scenes.find((s) => s.id === "s04-share-demo");

  return (
    <AbsoluteFill style={{ backgroundColor: C.soft }}>
      {/* Cinematic Background Music Bed */}
      <Audio src={staticFile("music/bed.mp3")} volume={musicVolume} />

      {/* Render All 10 Scenes with Sync'd Audio */}
      {scenes.map((scene) => {
        const SceneComponent = SCENE_COMPONENTS[scene.id];
        if (!SceneComponent) return null;

        return (
          <Sequence
            key={scene.id}
            from={scene.from}
            durationInFrames={scene.durationInFrames}
            name={scene.id}
          >
            {/* Visual Scene Component */}
            <SceneComponent duration={scene.durationInFrames} lead={scene.lead} />

            {/* Synchronized Voiceover Audio */}
            <Sequence from={scene.lead} durationInFrames={scene.voDurationFrames + 10}>
              <Audio src={staticFile(scene.audioPath)} volume={1.0} />
            </Sequence>
          </Sequence>
        );
      })}

      {/* SFX: Double Buzz on Known Hoax Red Screen */}
      {shareDemoScene && (
        <>
          <Sequence
            from={shareDemoScene.from + shareDemoScene.lead + 275}
            durationInFrames={FPS * 1.5}
            name="sfx-hoax-buzz"
          >
            <Audio src={staticFile("sfx/buzz.wav")} volume={0.65} />
          </Sequence>
          <Sequence
            from={shareDemoScene.from + shareDemoScene.lead + 452}
            durationInFrames={FPS * 1.5}
            name="sfx-second-buzz"
          >
            <Audio src={staticFile("sfx/buzz.wav")} volume={0.5} />
          </Sequence>
        </>
      )}
    </AbsoluteFill>
  );
};
