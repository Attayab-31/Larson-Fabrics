import Lenis from "lenis";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useTransition } from "@/src/components/layout/TransitionProvider";
import { exponentialEase, gsap, initGsap, ScrollTrigger } from "@/src/lib/gsap";
import { prefersReducedMotion } from "@/src/lib/motion";

initGsap();

const LenisContext = createContext<Lenis | null>(null);

export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

export interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const { pathname } = useTransition();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ limitCallbacks: true });
    }

    const instance = new Lenis({
      duration: 1.4,
      easing: exponentialEase,
      syncTouch: true,
      smoothWheel: true,
    });

    setLenis(instance);

    instance.on("scroll", ScrollTrigger.update);

    const onTicker = (time: number) => {
      instance.raf(time * 1000);
    };

    gsap.ticker.add(onTicker);
    gsap.ticker.lagSmoothing(0);

    const onRefresh = () => instance.resize();
    ScrollTrigger.addEventListener("refresh", onRefresh);
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      gsap.ticker.remove(onTicker);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    if (lenis) {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }
  }, [pathname, lenis]);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}
