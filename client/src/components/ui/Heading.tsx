import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type HeadingLevel = "h1" | "h2" | "h3" | "eyebrow";
export type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p" | "span";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level: HeadingLevel;
  as?: HeadingTag;
  balance?: boolean;
}

const levelStyles: Record<HeadingLevel, string> = {
  h1: "font-display text-5xl italic leading-[1.05] text-navy md:text-6xl lg:text-7xl",
  h2: "font-display text-4xl italic leading-tight text-navy md:text-5xl",
  h3: "font-body text-2xl font-medium leading-snug text-navy md:text-3xl",
  eyebrow:
    "font-body text-xs font-medium uppercase tracking-[0.2em] text-gold",
};

const defaultTag: Record<HeadingLevel, HeadingTag> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  eyebrow: "p",
};

export function Heading({
  level,
  as,
  balance = true,
  className,
  children,
  ...props
}: HeadingProps) {
  const styles = cn(
    levelStyles[level],
    balance && "text-balance",
    className
  );
  const tag = as ?? defaultTag[level];

  switch (tag) {
    case "h1":
      return (
        <h1 className={styles} {...props}>
          {children}
        </h1>
      );
    case "h2":
      return (
        <h2 className={styles} {...props}>
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3 className={styles} {...props}>
          {children}
        </h3>
      );
    case "h4":
      return (
        <h4 className={styles} {...props}>
          {children}
        </h4>
      );
    case "span":
      return (
        <span className={styles} {...props}>
          {children}
        </span>
      );
  }

  return (
    <p className={styles} {...props}>
      {children}
    </p>
  );
}
