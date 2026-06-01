"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { LarsonNeedleSvg, LARSON_NEEDLE_TIP } from "@/components/ui/LarsonNeedleSvg";
import { cn } from "@/lib/utils";

const SCALE_PRESS = 0.92;

const { x: TIP_X, y: TIP_Y } = LARSON_NEEDLE_TIP;

function canUseCustomCursor(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return (
    window.matchMedia("(hover: hover)").matches &&
    window.matchMedia("(pointer: fine)").matches
  );
}

export function CustomCursor() {
  const [supported, setSupported] = useState(true);

  const rootRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);

  const pressing = useRef(false);
  const hasPointer = useRef(false);
  const pointer = useRef({ x: 0, y: 0 });

  useLayoutEffect(() => {
    const root = rootRef.current;
    const needleEl = needleRef.current;
    if (!root || !needleEl) return;

    if (!canUseCustomCursor()) {
      setSupported(false);
      return;
    }

    setSupported(true);
    document.documentElement.classList.add("custom-cursor-active");

    needleEl.style.transformOrigin = `${TIP_X}px ${TIP_Y}px`;

    const applyPosition = (x: number, y: number) => {
      const pressScale = pressing.current ? SCALE_PRESS : 1;
      needleEl.style.left = `${x}px`;
      needleEl.style.top = `${y}px`;
      needleEl.style.transform = `scale(${pressScale})`;
    };

    const handleMove = (clientX: number, clientY: number) => {
      pointer.current.x = clientX;
      pointer.current.y = clientY;
      applyPosition(clientX, clientY);

      if (!hasPointer.current) {
        hasPointer.current = true;
        root.classList.add("custom-cursor-root--visible");
      }
    };

    const onPointerMove = (e: PointerEvent) => handleMove(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);

    const onDown = () => {
      pressing.current = true;
      applyPosition(pointer.current.x, pointer.current.y);
    };
    const onUp = () => {
      pressing.current = false;
      applyPosition(pointer.current.x, pointer.current.y);
    };

    const onLeave = () => {
      hasPointer.current = false;
      root.classList.remove("custom-cursor-root--visible");
    };

    const onEnter = () => {
      if (hasPointer.current) {
        root.classList.add("custom-cursor-root--visible");
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn(
        "custom-cursor-root pointer-events-none fixed inset-0 z-[9999]",
        !supported && "hidden"
      )}
      aria-hidden={!supported}
    >
      <div ref={needleRef} className="cursor-needle">
        <LarsonNeedleSvg className="cursor-needle__svg" />
      </div>
    </div>
  );
}
