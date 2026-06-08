import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap } from "@/src/lib/gsap";
import { prefersReducedMotion } from "@/src/lib/motion";
import { cn } from "@/src/lib/utils";

export interface CounterAnimProps {
  end: number;
  suffix?: string;
  prefix?: string;
  label?: string;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
  start?: string;
  duration?: number;
}

const numberFormatter = new Intl.NumberFormat("en-US");

function formatCounterValue(value: number) {
  return numberFormatter.format(value);
}

export function CounterAnim({
  end,
  suffix = "",
  prefix = "",
  label,
  className,
  valueClassName,
  labelClassName,
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
        valueEl.textContent = `${prefix}${formatCounterValue(end)}${suffix}`;
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
          valueEl.textContent = `${prefix}${formatCounterValue(
            Math.round(counter.val)
          )}${suffix}`;
        },
      });
    },
    { scope: rootRef, dependencies: [end, suffix, prefix, start, duration] }
  );

  return (
    <div ref={rootRef} className={cn("text-center", className)}>
      <span
        ref={valueRef}
        className={cn(
          "mx-auto block max-w-full whitespace-nowrap text-center font-numbers text-6xl font-medium leading-none md:text-7xl lg:text-[80px]",
          valueClassName ?? "text-navy"
        )}
        aria-live="polite"
      >
        {prefix}{formatCounterValue(0)}{suffix}
      </span>
      {label && (
        <p
          className={cn(
            "label-caps mt-3 text-xs leading-relaxed text-gold-dark",
            labelClassName
          )}
        >
          {label}
        </p>
      )}
    </div>
  );
}
