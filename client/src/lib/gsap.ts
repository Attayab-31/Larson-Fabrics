import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let initialized = false;

/** Exponential easing — matches Lenis default feel */
export const exponentialEase = (t: number): number =>
  Math.min(1, 1.001 - Math.pow(2, -10 * t));

/**
 * Register GSAP plugins, global config, and Larson custom eases.
 * Safe to call multiple times (runs once).
 */
export function initGsap(): void {
  if (initialized || typeof window === "undefined") return;

  gsap.registerPlugin(ScrollTrigger, CustomEase);

  gsap.config({ nullTargetWarn: false });
  ScrollTrigger.config({ limitCallbacks: true });

  CustomEase.create(
    "luxury",
    "M0,0,C0.12,0,0.28,0.42,0.45,0.72,0.62,0.95,0.82,1,1,1"
  );
  CustomEase.create("curtain", "M0,0,C0.43,0.13,0.23,0.96,1,1");

  initialized = true;
}

/** @deprecated Use initGsap() */
export function registerGsapPlugins(): void {
  initGsap();
}

export { gsap, ScrollTrigger, CustomEase };
