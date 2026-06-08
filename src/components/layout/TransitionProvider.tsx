import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Preloader } from "@/src/components/animations/Preloader";

interface RouterContextType {
  pathname: string;
  navigate: (path: string) => void;
  isTransitioning: boolean;
}

export const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function useTransition() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useTransition must be used within a TransitionProvider / RouterContext");
  }
  return context;
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  // Simple state router: detects hash changes or custom navigate commands matching '/about', '/collections', etc.
  const [pathname, setPathname] = useState("/");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const [transitionRun, setTransitionRun] = useState(0);

  const transitionRunRef = useRef(0);
  const activeRunRef = useRef(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const targetPathRef = useRef<string | null>(null);

  // Sync with browser back/forward buttons (using hashtag routing for SPA reliability in iframes)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") || "/";
      if (pathname !== hash) {
        setPathname(hash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    // Initialize
    const initialHash = window.location.hash.replace("#", "") || "/";
    setPathname(initialHash);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [pathname]);

  const navigate = useCallback((path: string) => {
    if (pathname === path) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      window.location.hash = path === "/" ? "" : `#${path}`;
      setPathname(path);
      return;
    }

    targetPathRef.current = path;

    requestAnimationFrame(() => {
      const nextRun = transitionRunRef.current + 1;
      transitionRunRef.current = nextRun;
      activeRunRef.current = nextRun;

      // STEP 1: Lock scroll and hide content
      document.documentElement.classList.add("page-transitioning");

      // STEP 2: Make transition overlay visible immediately
      const overlay = overlayRef.current;
      if (overlay) {
        overlay.classList.remove("transition-overlay--revealing");
        overlay.classList.add("transition-overlay--active");
      }

      setTransitionRun(nextRun);
      setIsTransitioning(true);
      setIsOverlayActive(true);
    });
  }, [pathname]);

  const handleTransitionExitStart = useCallback(() => {
    if (activeRunRef.current !== transitionRun) return;

    // Swap the page state inside the curtain overlay coverage!
    if (targetPathRef.current) {
      const newPath = targetPathRef.current;
      window.location.hash = newPath === "/" ? "" : `#${newPath}`;
      setPathname(newPath);
      targetPathRef.current = null;
    }

    overlayRef.current?.classList.add("transition-overlay--revealing");
    document.documentElement.classList.remove("page-transitioning");
    setIsTransitioning(false);
  }, [transitionRun]);

  const handleTransitionComplete = useCallback(() => {
    if (activeRunRef.current !== transitionRun) return;

    activeRunRef.current = 0;

    requestAnimationFrame(() => {
      overlayRef.current?.classList.remove(
        "transition-overlay--active",
        "transition-overlay--revealing"
      );
      document.documentElement.classList.remove("page-transitioning");
      setIsTransitioning(false);
      setIsOverlayActive(false);
    });
  }, [transitionRun]);

  useEffect(() => {
    return () => {
      overlayRef.current?.classList.remove(
        "transition-overlay--active",
        "transition-overlay--revealing"
      );
      document.documentElement.classList.remove("page-transitioning");
    };
  }, []);

  return (
    <RouterContext.Provider value={{ pathname, navigate, isTransitioning }}>
      {children}

      <div
        ref={overlayRef}
        className="transition-overlay"
        role="status"
        aria-live="polite"
        aria-label="Loading next page"
      >
        {isOverlayActive && (
          <Preloader
            key={transitionRun}
            mode="transition"
            onExitStart={handleTransitionExitStart}
            onComplete={handleTransitionComplete}
          />
        )}
      </div>
    </RouterContext.Provider>
  );
}
export function usePathname() {
  const ctx = useContext(RouterContext);
  return ctx ? ctx.pathname : "/";
}
export function usePathnameFallback() {
  const ctx = useContext(RouterContext);
  return ctx ? ctx.pathname : "/";
}
