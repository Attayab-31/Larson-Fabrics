"use client";

import { useGSAP } from "@gsap/react";
import { type ReactNode, useRef } from "react";
import { gsap, initGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

initGsap();

export interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay between children (seconds) */
  stagger?: number;
  /** ScrollTrigger start position */
  start?: string;
  childSelector?: string;
}

export function StaggerReveal({
  children,
  className,
  stagger = 0.12,
  start = "top 85%",
  childSelector = ":scope > *",
}: StaggerRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const targets = container.querySelectorAll(childSelector);
      if (!targets.length) return;

      if (prefersReducedMotion()) {
        gsap.set(targets, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(targets, { opacity: 0, y: 40 });

      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger,
        ease: "luxury",
        scrollTrigger: {
          trigger: container,
          start,
          once: true,
          toggleActions: "play none none none",
        },
      });
    },
    { scope: containerRef, dependencies: [stagger, start, childSelector] }
  );

  return (
    <div ref={containerRef} className={cn(className)}>
      {children}
    </div>
  );
}
