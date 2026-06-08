import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap } from "@/src/lib/gsap";
import {
  PRELOADER_COMPLETE_EVENT,
  PRELOADER_PENDING_CLASS,
} from "@/src/lib/preloader";
import { prefersReducedMotion } from "@/src/lib/motion";
import { cn } from "@/src/lib/utils";
import { useTransition } from "../layout/TransitionProvider";

const ctaBase =
  "inline-flex h-12 items-center justify-center px-6 font-body text-xs font-medium uppercase tracking-[0.15em] transition-colors duration-300 sm:h-14 sm:px-8 sm:text-sm sm:tracking-[0.2em]";

export function HeroTextOverlay() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { navigate } = useTransition();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const targets = root.querySelectorAll("[data-hero-reveal]");
      if (!targets.length) return;

      const play = () => {
        if (prefersReducedMotion()) {
          gsap.set(targets, { y: 0, opacity: 1 });
          return;
        }

        gsap.fromTo(
          targets,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.1,
          }
        );
      };

      if (!document.documentElement.classList.contains(PRELOADER_PENDING_CLASS)) {
        play();
        return;
      }

      window.addEventListener(PRELOADER_COMPLETE_EVENT, play, { once: true });
      return () => window.removeEventListener(PRELOADER_COMPLETE_EVENT, play);
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      className="pointer-events-none relative z-10 flex h-full items-center px-4 pt-20 pb-12 sm:px-6 sm:pt-24 md:px-12 lg:px-20"
    >
      <div className="pointer-events-auto max-w-2xl">
        <p
          data-hero-reveal
          className="mb-4 font-body text-[10px] font-medium uppercase tracking-[3px] text-gold sm:mb-5 sm:text-[11px] sm:tracking-[4px]"
        >
          Azam Market Lahore
        </p>

        <h1 className="font-display text-[clamp(2.25rem,8vw,6rem)] leading-[0.95] italic text-white">
          <span data-hero-reveal className="inline-block">
            Woven in
          </span>
          <br />
          <span data-hero-reveal className="inline-block">
            Excellence
          </span>
        </h1>

        <p
          data-hero-reveal
          className="mt-4 max-w-md font-body text-sm leading-relaxed text-white/75 sm:mt-6 sm:text-base md:text-lg"
        >
          Exquisite woven fabrics with superior thread quality and intricate patterns — 
          crafted for designers who demand perfection.
        </p>

        <div data-hero-reveal className="mt-7 flex flex-wrap gap-3 sm:mt-10 sm:gap-4">
          <button
            onClick={() => navigate("/collections")}
            className={cn(
              ctaBase,
              "bg-gold text-navy hover:bg-gold-dark hover:text-white cursor-pointer"
            )}
          >
            Explore Collection
          </button>
          <button
            onClick={() => navigate("/about")}
            className={cn(
              ctaBase,
              "border-2 border-white/80 bg-transparent text-white hover:bg-white hover:text-navy cursor-pointer"
            )}
          >
            Our Heritage
          </button>
        </div>
      </div>
    </div>
  );
}
