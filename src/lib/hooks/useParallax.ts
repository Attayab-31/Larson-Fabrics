import { type RefObject, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/src/lib/gsap";
import { prefersReducedMotion } from "@/src/lib/motion";

export interface UseParallaxOptions {
  start?: string;
  end?: string;
  distance?: number;
}

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
