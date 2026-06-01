"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, initGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

initGsap();

export interface CounterAnimProps {
  end: number;
  suffix?: string;
  prefix?: string;
  label?: string;
  className?: string;
  start?: string;
  duration?: number;
}

export function CounterAnim({
  end,
  suffix = "",
  prefix = "",
  label,
  className,
  start = "top 85%",
  duration = 2,
}: CounterAnimProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const valueEl = valueRef.current;
      const root = rootRef.current;
      if (!valueEl || !root) return;

      if (prefersReducedMotion()) {
        valueEl.textContent = `${prefix}${end}${suffix}`;
        return;
      }

      const counter = { val: 0 };

      gsap.to(counter, {
        val: end,
        duration,
        ease: "luxury",
        snap: { val: 1 },
        scrollTrigger: {
          trigger: root,
          start,
          once: true,
          toggleActions: "play none none none",
        },
        onUpdate: () => {
          valueEl.textContent = `${prefix}${Math.round(counter.val)}${suffix}`;
        },
      });
    },
    { scope: rootRef, dependencies: [end, suffix, prefix, start, duration] }
  );

  return (
    <div ref={rootRef} className={cn("text-center", className)}>
      <span
        ref={valueRef}
        className="font-numbers text-6xl font-medium leading-none text-navy md:text-7xl lg:text-[80px]"
        aria-live="polite"
      >
        {prefix}0{suffix}
      </span>
      {label && (
        <p className="label-caps mt-3 text-gold-dark">{label}</p>
      )}
    </div>
  );
}
