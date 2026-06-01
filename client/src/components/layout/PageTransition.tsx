"use client";

import { animate } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

const EASE = [0.43, 0.13, 0.23, 0.96] as const;
const HALF_DURATION = 0.25;

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const curtainRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);
  const prevPath = useRef(pathname);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    setDisplayChildren(children);
  }, [children]);

  useEffect(() => {
    const curtain = curtainRef.current;
    if (!curtain) return;

    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevPath.current = pathname;
      return;
    }

    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      setDisplayChildren(children);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setShowLabel(true);
      await animate(
        curtain,
        { y: "0%" },
        { duration: HALF_DURATION, ease: EASE }
      );
      if (cancelled) return;

      setDisplayChildren(children);

      await animate(
        curtain,
        { y: "-100%" },
        { duration: HALF_DURATION, ease: EASE }
      );
      if (cancelled) return;

      setShowLabel(false);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [pathname, children]);

  return (
    <>
      <div className="flex flex-1 flex-col">{displayChildren}</div>

      <div
        ref={curtainRef}
        className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center bg-navy"
        style={{ transform: "translateY(-100%)" }}
        aria-hidden
      >
        <span
          className={`font-display text-5xl italic tracking-[0.35em] text-gold transition-opacity duration-300 md:text-6xl ${
            showLabel ? "opacity-100" : "opacity-0"
          }`}
        >
          LARSON
        </span>
      </div>
    </>
  );
}
