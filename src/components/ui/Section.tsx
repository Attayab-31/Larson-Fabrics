import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/src/lib/utils";

export type SectionVariant = "dark" | "light" | "ivory";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  variant?: SectionVariant;
  container?: boolean;
}

const variantStyles: Record<SectionVariant, string> = {
  dark: "bg-navy-dark text-white",
  light: "bg-white text-navy",
  ivory: "bg-ivory text-navy",
};

const paddingStyles =
  "px-6 py-20 md:px-12 md:py-28 lg:px-20";

export const Section = forwardRef<HTMLElement, SectionProps>(
  function Section(
    { variant = "ivory", container = true, className, children, ...props },
    ref
  ) {
    return (
      <section
        ref={ref}
        className={cn(variantStyles[variant], paddingStyles, className)}
        {...props}
      >
        {container ? (
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        ) : (
          children
        )}
      </section>
    );
  }
);

Section.displayName = "Section";
export default Section;
