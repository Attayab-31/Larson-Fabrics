"use client";

import { useGSAP } from "@gsap/react";
import { createElement, useMemo, useRef } from "react";
import { gsap, initGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

initGsap();

export type SplitTextMode = "chars" | "words";

export interface SplitTextProps {
  text: string;
  mode?: SplitTextMode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  start?: string;
}

export function SplitText({
  text,
  mode = "words",
  className,
  as: Tag = "h2",
  start = "top 85%",
}: SplitTextProps) {
  const rootRef = useRef<HTMLElement>(null);

  const units = useMemo(() => {
    if (mode === "chars") {
      return text.split("").map((char, i) => ({
        key: `c-${i}`,
        content: char === " " ? "\u00A0" : char,
      }));
    }
    return text.split(" ").map((word, i) => ({
      key: `w-${i}`,
      content: word,
    }));
  }, [text, mode]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const spans = root.querySelectorAll("[data-split-unit]");
      if (!spans.length) return;

      if (prefersReducedMotion()) {
        gsap.set(spans, { opacity: 1, scale: 1, y: 0 });
        return;
      }

      gsap.set(spans, { opacity: 0, scale: 0.6, y: 12 });

      gsap.to(spans, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.9,
        stagger: mode === "chars" ? 0.03 : 0.08,
        ease: "back.out(1.6)",
        scrollTrigger: {
          trigger: root,
          start,
          once: true,
          toggleActions: "play none none none",
        },
      });
    },
    { scope: rootRef, dependencies: [text, mode, start] }
  );

  return createElement(
    Tag,
    {
      ref: rootRef,
      className: cn("inline-block", className),
      "aria-label": text,
    },
    createElement("span", { className: "sr-only" }, text),
    createElement(
      "span",
      { "aria-hidden": true, className: "inline" },
      units.map((unit, index) =>
        createElement(
          "span",
          {
            key: unit.key,
            "data-split-unit": true,
            className: "inline-block will-change-transform",
          },
          unit.content,
          mode === "words" && index < units.length - 1 ? "\u00A0" : null
        )
      )
    )
  );
}
