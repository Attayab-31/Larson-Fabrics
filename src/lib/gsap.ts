import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let initialized = false;

export const exponentialEase = (t: number): number =>
  Math.min(1, 1.001 - Math.pow(2, -10 * t));

export const CURTAIN_EASE_CSS = "cubic-bezier(0.43, 0.13, 0.23, 0.96)";

export const CURTAIN_EASE_FM = [0.43, 0.13, 0.23, 0.96] as const;

export function initGsap(): void {
  if (initialized || typeof window === "undefined") return;

  gsap.registerPlugin(CustomEase);

  gsap.config({ nullTargetWarn: false });

  CustomEase.create(
    "luxury",
    "M0,0,C0.12,0,0.28,0.42,0.45,0.72,0.62,0.95,0.82,1,1,1"
  );
  CustomEase.create("curtain", "M0,0,C0.43,0.13,0.23,0.96,1,1");

  initialized = true;
}

export { gsap, ScrollTrigger, CustomEase };
