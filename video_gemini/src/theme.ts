import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadHind } from "@remotion/google-fonts/HindSiliguri";

export const FONT = loadInter("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
}).fontFamily;

export const BANGLA = loadHind("normal", {
  weights: ["500", "700"],
  subsets: ["bengali"],
  ignoreTooManyRequestsWarning: true,
}).fontFamily;

export const C = {
  // Clean Light Canvas (Claude aesthetic)
  paper: "#FFFFFF",
  soft: "#FBFBFA",
  card: "#FFFFFF",
  cardAlt: "#F4F5F7",
  
  // High-Contrast Typography
  ink: "#111111",
  muted: "#6B6F78",
  lightMuted: "#9CA3AF",
  
  // Signature Periwinkle Brand Accent
  accent: "#5C6BC0",
  accentLight: "#EEF2FF",
  accentBorder: "rgba(92, 107, 192, 0.25)",
  
  // Verdict Colors
  verdictRed: "#C62828",
  verdictRedLight: "#FFEBEE",
  verdictGreen: "#2E7D32",
  verdictGreenLight: "#E8F5E9",
  verdictNeutral: "#616161",
  
  // Minimalist Lines & Shadows
  border: "#E8E8E5",
  borderLight: "#EEEEEC",
  shadowSoft: "0 18px 45px rgba(0, 0, 0, 0.06)",
  shadowPhone: "0 28px 70px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.05)",
};

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
