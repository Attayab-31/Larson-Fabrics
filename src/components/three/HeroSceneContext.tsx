import { createContext, useContext } from "react";
import type { HeroQualityConfig } from "@/src/lib/heroPerformance";

export interface HeroSceneContextValue {
  config: HeroQualityConfig;
  visible: boolean;
}

export const HeroSceneContext = createContext<HeroSceneContextValue | null>(null);

export function useHeroScene(): HeroSceneContextValue {
  const ctx = useContext(HeroSceneContext);
  if (!ctx) {
    throw new Error("useHeroScene must be used within HeroSceneContext");
  }
  return ctx;
}
