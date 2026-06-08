import {
  type CSSProperties,
  type MouseEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { cn } from "@/src/lib/utils";

export interface FabricCard3DProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const MAX_TILT = 8;
const PARALLAX_FACTOR = 1.05;
const PERSPECTIVE = 850;

export function FabricCard3D({
  children,
  onClick,
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
      x: x * 10 * PARALLAX_FACTOR,
      y: y * 10 * PARALLAX_FACTOR,
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
       ? "transform 0.1s ease-out"
       : "transform 0.6s cubic-bezier(0.25, 1, 0.33, 1)",
  };

  return (
    <div
      ref={cardRef}
      className={cn("fabric-card-3d group relative cursor-pointer overflow-hidden rounded-sm", className)}
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={updateFromMouse}
      onMouseLeave={resetTilt}
      onClick={onClick}
    >
      <div
        className={cn(
          "fabric-card-3d__border pointer-events-none absolute -inset-px rounded-sm opacity-0 transition-opacity duration-350 z-20",
          hovered && "opacity-100"
        )}
        aria-hidden
      />
      <div 
        className="w-full h-full transition-transform duration-500 ease-out"
        style={{
          transform: hovered ? `translate(${parallax.x * 0.4}px, ${parallax.y * 0.4}px) scale(1.04)` : "none"
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default FabricCard3D;
