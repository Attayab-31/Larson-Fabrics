import { type HTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

export type BadgeVariant = "navy" | "gold" | "outline" | "ivory";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, string> = {
  navy: "bg-navy text-white",
  gold: "bg-gold text-navy",
  outline: "border border-navy/30 bg-transparent text-navy",
  ivory: "bg-ivory text-navy border border-navy/10",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px] leading-tight",
  md: "px-3 py-1 text-xs leading-normal",
  lg: "px-4 py-1.5 text-sm leading-normal",
};

export function Badge({
  variant = "navy",
  size = "sm",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm font-body font-semibold uppercase tracking-[0.15em]",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
export default Badge;
