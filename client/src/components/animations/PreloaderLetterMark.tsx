"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface PreloaderLetterMarkProps {
  className?: string;
}

/**
 * Layered serif “L” with extrusion + gold edge — reads as 3D without WebGL.
 */
export const PreloaderLetterMark = forwardRef<HTMLDivElement, PreloaderLetterMarkProps>(
  function PreloaderLetterMark({ className }, ref) {
    return (
      <div ref={ref} className={cn("preloader-letter", className)} aria-hidden>
        <div className="preloader-letter__stack">
          <span className="preloader-letter__layer preloader-letter__layer--4">L</span>
          <span className="preloader-letter__layer preloader-letter__layer--3">L</span>
          <span className="preloader-letter__layer preloader-letter__layer--2">L</span>
          <span className="preloader-letter__layer preloader-letter__layer--1">L</span>
          <span className="preloader-letter__face font-display italic">L</span>
          <span className="preloader-letter__sheen" />
        </div>
      </div>
    );
  }
);
