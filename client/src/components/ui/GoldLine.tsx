"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, initGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

initGsap();

export interface GoldLineProps {
  className?: string;
  /** ScrollTrigger start position */
  start?: string;
  duration?: number;
  delay?: number;
  /** Max width of the line container */
  fullWidth?: boolean;
}

export function GoldLine({
  className,
  start = "top 85%",
  duration = 1.2,
  delay = 0,
  fullWidth = true,
}: GoldLineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const line = lineRef.current;
      const container = containerRef.current;
      if (!line || !container) return;

      if (prefersReducedMotion()) {
        gsap.set(line, { scaleX: 1 });
        return;
      }

      gsap.set(line, { scaleX: 0, transformOrigin: "left center" });

      gsap.to(line, {
        scaleX: 1,
        duration,
        delay,
        ease: "power3.inOut",
        scrollTrigger: {
          trigger: container,
          start,
          once: true,
          toggleActions: "play none none none",
        },
      });
    },
    { scope: containerRef, dependencies: [start, duration, delay] }
  );

  return (
    <div
      ref={containerRef}
      className={cn(fullWidth ? "w-full" : "w-48", className)}
      aria-hidden
    >
      <div
        ref={lineRef}
        className="h-px w-full origin-left bg-gradient-to-r from-gold via-gold-dark to-gold"
      />
    </div>
  );
}
