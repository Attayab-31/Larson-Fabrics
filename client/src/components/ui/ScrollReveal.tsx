"use client";

import { useGSAP } from "@gsap/react";
import { type ReactNode, useRef } from "react";
import { gsap, initGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

initGsap();

export type ScrollRevealDirection = "up" | "down" | "left" | "right";

export interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: ScrollRevealDirection;
  /** Start animation when element enters viewport (default: 85%) */
  start?: string;
  once?: boolean;
}

const directionOffset: Record<
  ScrollRevealDirection,
  { x: number; y: number }
> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.9,
  direction = "up",
  start = "top 85%",
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const { x, y } = directionOffset[direction];

      if (prefersReducedMotion()) {
        gsap.set(el, { opacity: 1, x: 0, y: 0 });
        return;
      }

      gsap.fromTo(
        el,
        { opacity: 0, x, y },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start,
            once,
            toggleActions: once ? "play none none none" : "play none none reverse",
          },
        }
      );
    },
    { scope: ref, dependencies: [delay, duration, direction, start, once] }
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
