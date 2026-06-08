import { prefersReducedMotion } from "@/src/lib/motion";

export type HeroQuality = "off" | "mobile" | "low" | "medium" | "high";

export interface HeroQualityConfig {
  clothSegments: number;
  textureResolution: number;
  maxDpr: number;
  antialias: boolean;
  floatIntensity: number;
  performanceMin: number;
  performanceMax: number;
  performanceDebounce: number;
  canvasHeight: number;
}

export const HERO_QUALITY_CONFIG: Record<Exclude<HeroQuality, "off">, HeroQualityConfig> = {
  mobile: {
    clothSegments: 8,
    textureResolution: 1024,
    maxDpr: 1,
    antialias: false,
    floatIntensity: 0.08,
    performanceMin: 0.3,
    performanceMax: 0.6,
    performanceDebounce: 500,
    canvasHeight: 500,
  },
  low: {
    clothSegments: 12,
    textureResolution: 2048,
    maxDpr: 1,
    antialias: false,
    floatIntensity: 0.15,
    performanceMin: 0.4,
    performanceMax: 0.8,
    performanceDebounce: 400,
    canvasHeight: 600,
  },
  medium: {
    clothSegments: 18,
    textureResolution: 2048,
    maxDpr: 1.2,
    antialias: false,
    floatIntensity: 0.22,
    performanceMin: 0.5,
    performanceMax: 1,
    performanceDebounce: 300,
    canvasHeight: 700,
  },
  high: {
    clothSegments: 24,
    textureResolution: 2048,
    maxDpr: 1.35,
    antialias: true,
    floatIntensity: 0.28,
    performanceMin: 0.5,
    performanceMax: 1,
    performanceDebounce: 280,
    canvasHeight: 800,
  },
};

export function getHeroQuality(): HeroQuality {
  if (typeof window === "undefined") return "off";
  if (prefersReducedMotion()) return "off";
  
  const cores = navigator.hardwareConcurrency ?? 4;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const isTablet = window.matchMedia("(max-width: 1024px)").matches;
  const isTouchOnly = window.matchMedia("(pointer: coarse)").matches;

  if (cores <= 2 || window.innerWidth < 360) return "off";
  if (isMobile || isTouchOnly) return "mobile";
  if (isTablet || cores <= 4) return "low";
  if (cores <= 8) return "medium";
  return "high";
}
