import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "navy" | "gold" | "outline" | "ivory";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  navy: "bg-navy text-white",
  gold: "bg-gold text-navy",
  outline: "border border-navy/30 bg-transparent text-navy",
  ivory: "bg-ivory text-navy border border-navy/10",
};

export function Badge({
  variant = "navy",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2.5 py-1",
        "font-body text-[10px] font-medium uppercase tracking-[0.2em]",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
