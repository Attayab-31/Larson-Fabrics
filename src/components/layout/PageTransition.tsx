import { type ReactNode } from "react";
import { useTransition } from "./TransitionProvider";

export function PageTransition({ children }: { children: ReactNode }) {
  const { isTransitioning } = useTransition();

  return (
    <div className={`flex flex-1 flex-col transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
      {children}
    </div>
  );
}
