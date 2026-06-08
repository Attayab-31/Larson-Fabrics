import { useId } from "react";
import { cn } from "@/src/lib/utils";

export const LARSON_NEEDLE_VIEWBOX = "0 0 28 40";
export const LARSON_NEEDLE_TIP = { x: 5, y: 5 } as const;
export const LARSON_NEEDLE_HORIZONTAL_ROTATE = -58;
export const LARSON_NEEDLE_CENTER = { x: 14, y: 20 } as const;

export type LarsonNeedleOrientation = "cursor" | "horizontal";
export type LarsonNeedleSize = "cursor" | "preloader";

export interface LarsonNeedleSvgProps {
  className?: string;
  width?: number;
  height?: number;
  drawClassName?: string;
  orientation?: LarsonNeedleOrientation;
  size?: LarsonNeedleSize;
}

function NeedlePaths({
  drawClassName,
  isPreloader,
  shaftGradientId,
  goldGradientId,
}: {
  drawClassName: string;
  isPreloader: boolean;
  shaftGradientId: string;
  goldGradientId: string;
}) {
  const draw = drawClassName;
  const sw = isPreloader ? 1.65 : 1.25;
  const shaftSw = isPreloader ? 1.55 : 1.15;

  return (
    <>
      <path
        className={cn(draw, "larson-needle__thread")}
        d="M20 32
           C24 30 26 25 23 21
           C20 18 16 20 17.5 24
           C18.5 27 19.5 30 20 32Z"
        stroke={isPreloader ? `url(#${goldGradientId})` : "#D4AF37"}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className={draw}
        d="M20.5 31 C23 29 24.5 26 22.5 23"
        stroke="#8B7536"
        strokeWidth={isPreloader ? 0.75 : 0.55}
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        className={cn(draw, "larson-needle__shaft")}
        d="M5.8 5.8 L22.2 35.5"
        stroke={isPreloader ? `url(#${shaftGradientId})` : "#082567"}
        strokeWidth={shaftSw}
        strokeLinecap="round"
      />
      <path
        className={draw}
        d="M6.2 6.2 L22.6 35.5"
        stroke="#4a6bb5"
        strokeWidth={isPreloader ? 0.55 : 0.4}
        strokeLinecap="round"
        opacity="0.55"
      />
      <ellipse
        className={draw}
        cx="22"
        cy="35"
        rx={isPreloader ? 1.35 : 1.1}
        ry={isPreloader ? 2.35 : 1.9}
        stroke="#D4AF37"
        strokeWidth={isPreloader ? 1.05 : 0.85}
        fill={isPreloader ? "rgba(212,175,55,0.15)" : "none"}
      />
      <circle
        className="larson-needle__tip"
        cx="5"
        cy="5"
        r={isPreloader ? 1.35 : 1.1}
        fill={isPreloader ? `url(#${goldGradientId})` : "#D4AF37"}
      />
    </>
  );
}

export function LarsonNeedleSvg({
  className,
  width,
  height,
  drawClassName = "larson-needle__draw",
  orientation = "cursor",
  size = "cursor",
}: LarsonNeedleSvgProps) {
  const uid = useId().replace(/:/g, "");
  const isHorizontal = orientation === "horizontal";
  const isPreloader = size === "preloader";
  const { x: cx, y: cy } = LARSON_NEEDLE_CENTER;

  const shaftGradientId = `larson-shaft-${uid}`;
  const goldGradientId = `larson-gold-${uid}`;

  const defaultW = isPreloader ? undefined : 28;
  const defaultH = isPreloader ? undefined : 40;

  return (
    <svg
      className={cn(
        "larson-needle-svg",
        isHorizontal && "larson-needle-svg--horizontal",
        isPreloader && "larson-needle-svg--preloader",
        className
      )}
      width={width ?? defaultW}
      height={height ?? defaultH}
      viewBox={LARSON_NEEDLE_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {isPreloader && (
        <defs>
          <linearGradient
            id={shaftGradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#2a4f9e" />
            <stop offset="45%" stopColor="#082567" />
            <stop offset="100%" stopColor="#051840" />
          </linearGradient>
          <linearGradient
            id={goldGradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#f0d875" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8B7536" />
          </linearGradient>
        </defs>
      )}

      <g
        className={isPreloader ? "larson-needle__art" : undefined}
        transform={
          isHorizontal
            ? `rotate(${LARSON_NEEDLE_HORIZONTAL_ROTATE} ${cx} ${cy})`
            : undefined
        }
      >
        <NeedlePaths
          drawClassName={drawClassName}
          isPreloader={isPreloader}
          shaftGradientId={shaftGradientId}
          goldGradientId={goldGradientId}
        />
      </g>
    </svg>
  );
}
