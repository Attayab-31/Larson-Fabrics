import { type DependencyList, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/src/lib/gsap";
import { prefersReducedMotion } from "@/src/lib/motion";

export interface GsapScrollAnimationConfig {
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  scrollTrigger?: ScrollTrigger.Vars;
}

export function useGsapScroll(
  ref: RefObject<HTMLElement | null>,
  config: GsapScrollAnimationConfig,
  dependencies: DependencyList = []
): void {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (typeof window !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ limitCallbacks: true });
      }

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
