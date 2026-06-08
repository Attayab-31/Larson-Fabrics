import {
  type ButtonHTMLAttributes,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import { cn } from "@/src/lib/utils";

export type ButtonVariant = "primary" | "gold" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  magnetic?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-navy text-white hover:bg-navy-mid focus-visible:ring-navy/40 disabled:bg-navy/60",
  gold: "bg-gold text-navy hover:bg-gold-dark hover:text-white focus-visible:ring-gold/50 disabled:bg-gold/60",
  outline:
    "border-2 border-navy bg-transparent text-navy hover:bg-navy hover:text-white focus-visible:ring-navy/30 disabled:border-navy/40 disabled:text-navy/50",
  ghost:
    "bg-transparent text-navy hover:bg-navy/5 focus-visible:ring-navy/20 disabled:text-navy/40",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs tracking-widest leading-none",
  md: "h-11 px-6 text-sm tracking-widest leading-none",
  lg: "h-14 px-8 text-sm tracking-[0.2em] leading-none",
};

const MAGNETIC_STRENGTH = 0.35;

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  magnetic = true,
  disabled,
  className,
  children,
  onMouseMove,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDisabled = disabled || loading;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseMove?.(e);
      if (!magnetic || isDisabled) return;

      const el = buttonRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * MAGNETIC_STRENGTH;
      const y = (e.clientY - rect.top - rect.height / 2) * MAGNETIC_STRENGTH;
      setOffset({ x, y });
    },
    [magnetic, isDisabled, onMouseMove]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseLeave?.(e);
      setOffset({ x: 0, y: 0 });
    },
    [onMouseLeave]
  );

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={isDisabled}
      aria-busy={loading}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 overflow-hidden cursor-pointer",
        "font-body font-medium uppercase transition-[background-color,color,box-shadow,transform]",
        "duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:pointer-events-none rounded-sm",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {loading && (
        <span
          className="absolute inset-0 flex items-center justify-center bg-inherit"
          aria-hidden
        >
          <Spinner className={variant === "gold" ? "text-navy" : "text-white"} />
        </span>
      )}
      <span
        className={cn(
          "inline-flex items-center justify-center gap-2",
          loading && "opacity-0"
        )}
      >
        {children}
      </span>
    </button>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-5 w-5 animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
export default Button;
