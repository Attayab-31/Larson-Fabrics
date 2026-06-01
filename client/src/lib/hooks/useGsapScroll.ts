"use client";

import { useGSAP } from "@gsap/react";
import {
  type DependencyList,
  type RefObject,
} from "react";
import { gsap, initGsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

initGsap();

export interface GsapScrollAnimationConfig {
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  scrollTrigger?: ScrollTrigger.Vars;
}

/**
 * Declarative ScrollTrigger animation tied to a ref.
 * Cleans up on unmount; no-ops when prefers-reduced-motion is set.
 */
export function useGsapScroll(
  ref: RefObject<HTMLElement | null>,
  config: GsapScrollAnimationConfig,
  dependencies: DependencyList = []
): void {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        if (config.to) gsap.set(el, config.to);
        else if (config.from) gsap.set(el, { clearProps: "all" });
        return;
      }

      const scrollTrigger: ScrollTrigger.Vars = {
        trigger: el,
        ...config.scrollTrigger,
      };

      if (config.from && config.to) {
        gsap.fromTo(el, config.from, { ...config.to, scrollTrigger });
        return;
      }

      if (config.from) {
        gsap.from(el, { ...config.from, scrollTrigger });
        return;
      }

      if (config.to) {
        gsap.to(el, { ...config.to, scrollTrigger });
      }
    },
    { scope: ref, dependencies: [...dependencies] }
  );
}
