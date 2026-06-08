import { useEffect, useRef, useState, useSyncExternalStore, useMemo } from "react";
import { ClothHeroFallback } from "@/src/components/three/ClothHeroFallback";
import { HeroTextOverlay } from "@/src/components/three/HeroTextOverlay";
import {
  getHeroQuality,
  HERO_QUALITY_CONFIG,
  type HeroQuality,
} from "@/src/lib/heroPerformance";
import {
  PRELOADER_COMPLETE_EVENT,
  PRELOADER_PENDING_CLASS,
} from "@/src/lib/preloader";
import { RealisticClothHeroScene } from "./RealisticClothHeroScene";

function subscribeQuality(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

function getQualitySnapshot(): HeroQuality {
  return getHeroQuality();
}

function getServerQualitySnapshot(): HeroQuality {
  return "off";
}

function subscribePreloader(onStoreChange: () => void) {
  window.addEventListener(PRELOADER_COMPLETE_EVENT, onStoreChange);
  return () => window.removeEventListener(PRELOADER_COMPLETE_EVENT, onStoreChange);
}

function getPreloaderReadySnapshot(): boolean {
  if (typeof document === "undefined") return false;
  return !document.documentElement.classList.contains(PRELOADER_PENDING_CLASS);
}

function getServerPreloaderSnapshot(): boolean {
  return false;
}

export function RealisticClothHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const quality = useSyncExternalStore(
    subscribeQuality,
    getQualitySnapshot,
    getServerQualitySnapshot
  );
  const preloaderDone = useSyncExternalStore(
    subscribePreloader,
    getPreloaderReadySnapshot,
    getServerPreloaderSnapshot
  );
  const [inView, setInView] = useState(true);

  const config = quality === "off" ? null : HERO_QUALITY_CONFIG[quality];
  const heightClass = useMemo(() => {
    if (!config) return "h-screen min-h-[600px]";
    if (quality === "mobile") return "h-screen min-h-[500px] sm:min-h-[600px]";
    if (quality === "low") return "h-screen min-h-[600px] md:min-h-[700px]";
    return "h-screen min-h-[700px] lg:min-h-[800px]";
  }, [config, quality]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { root: null, rootMargin: "80px 0px", threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showWebGL = quality !== "off" && preloaderDone;

  return (
    <section
      ref={sectionRef}
      data-nav-dark
      data-hero-webgl={showWebGL ? "true" : "false"}
      className={`relative isolate w-full overflow-hidden bg-[#0A1F5C] ${heightClass}`}
    >
      <ClothHeroFallback subtle={showWebGL} />

      {showWebGL && config && (
        <div className="pointer-events-none absolute inset-0 z-[1]">
          <RealisticClothHeroScene config={config} visible={inView} />
        </div>
      )}

      {/* Heavy shading gradient matching client specs */}
      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-[#0A1F5C] via-[rgba(10,31,92,0.92)] to-transparent"
        aria-hidden
      />

      <HeroTextOverlay />
    </section>
  );
}
export default RealisticClothHero;
