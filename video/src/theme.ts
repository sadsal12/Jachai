import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadHind } from "@remotion/google-fonts/HindSiliguri";

// Same tokens as design/app-kit/jachai-tokens.css (light), plus the app's verdict colours.
export const C = {
  ink: "#111111",
  paper: "#FFFFFF",
  soft: "#F2F2F0",
  accent: "#8CA8F9",
  muted: "#6B6F78",
  red: "#C62828",
  green: "#2E7D32",
  night: "#0E0E0F",
};

export const FONT = loadInter("normal", { weights: ["400", "500", "600", "700", "800"] }).fontFamily;
export const BANGLA = loadHind("normal", { weights: ["500", "700"] }).fontFamily;

export const FPS = 30;
export const W = 1920;
export const H = 1080;
