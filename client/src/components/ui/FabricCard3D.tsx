"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type CSSProperties,
  type MouseEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export interface FabricCard3DProps {
  title: string;
  subtitle?: string;
  imageSrc: string;
  imageAlt: string;
  href?: string;
  className?: string;
}

const MAX_TILT = 10;
const PARALLAX_FACTOR = 1.1;
const PERSPECTIVE = 800;

export function FabricCard3D({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  href,
  className,
}: FabricCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const updateFromMouse = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setTilt({
      rotateX: -y * MAX_TILT,
      rotateY: x * MAX_TILT,
    });
    setParallax({
      x: x * 12 * PARALLAX_FACTOR,
      y: y * 12 * PARALLAX_FACTOR,
    });
  }, []);

  const resetTilt = useCallback(() => {
    setHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
    setParallax({ x: 0, y: 0 });
  }, []);

  const cardStyle: CSSProperties = {
    transform: `perspective(${PERSPECTIVE}px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
    transition: hovered
      ? "transform 0.12s ease-out"
      : "transform 0.65s cubic-bezier(0.23, 1, 0.32, 1)",
  };

  const inner = (
    <div
      ref={cardRef}
      className={cn("fabric-card-3d group relative", className)}
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={updateFromMouse}
      onMouseLeave={resetTilt}
    >
      <div
        className={cn(
          "fabric-card-3d__border pointer-events-none absolute -inset-px rounded-sm opacity-0 transition-opacity duration-500",
          hovered && "opacity-100"
        )}
        aria-hidden
      />

      <div className="relative overflow-hidden rounded-sm bg-navy-dark shadow-xl">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out"
            style={{
              transform: `translate(${parallax.x}px, ${parallax.y}px) scale(1.08)`,
              transition: hovered
                ? "transform 0.12s ease-out"
                : "transform 0.65s cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <h3 className="font-display text-2xl italic leading-tight">{title}</h3>
          {subtitle && (
            <p className="mt-1 font-body text-xs uppercase tracking-[0.2em] text-gold">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2">
        {inner}
      </Link>
    );
  }

  return inner;
}
