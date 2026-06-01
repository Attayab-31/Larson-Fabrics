"use client";

import { useGSAP } from "@gsap/react";
import { type RefObject, useState } from "react";
import { gsap, initGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

initGsap();

export interface UseParallaxOptions {
  /** ScrollTrigger start (default: "top bottom") */
  start?: string;
  /** ScrollTrigger end (default: "bottom top") */
  end?: string;
  /** Vertical travel in px at progress 1 (default: 80) */
  distance?: number;
}

/**
 * Scrubbed parallax timeline; returns normalized progress 0→1.
 */
export function useParallax(
  ref: RefObject<HTMLElement | null>,
  options: UseParallaxOptions = {}
): number {
  const {
    start = "top bottom",
    end = "bottom top",
    distance = 80,
  } = options;

  const [yProgress, setYProgress] = useState(0);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        setYProgress(0);
        return;
      }

      const tween = gsap.fromTo(
        el,
        { y: -distance / 2 },
        {
          y: distance / 2,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start,
            end,
            scrub: true,
            onUpdate: (self) => setYProgress(self.progress),
          },
        }
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: ref, dependencies: [start, end, distance] }
  );

  return yProgress;
}
