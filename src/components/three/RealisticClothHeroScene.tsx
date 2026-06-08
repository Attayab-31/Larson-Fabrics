import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { PremiumFabricHero } from "@/src/components/three/PremiumFabricHero";
import { HeroSceneContext } from "@/src/components/three/HeroSceneContext";
import type { HeroQualityConfig } from "@/src/lib/heroPerformance";
import { suppressThreeClockDeprecationWarning } from "@/src/lib/suppressThreeClockWarning";

suppressThreeClockDeprecationWarning();

function StudioLights() {
  return (
    <>
      <color attach="background" args={["#0A1F5C"]} />
      
      {/* Dynamic Key light (gold warmth) */}
      <directionalLight
        position={[6, 8, 7]}
        intensity={1.8}
        color="#fffbf2"
        castShadow
      />
      
      {/* Cool fill light (naval depth) */}
      <directionalLight position={[-4, 3, -5]} intensity={0.7} color="#5e85c2" />
      
      {/* Soft Rim light for edge-shine */}
      <directionalLight position={[3, 2, 6]} intensity={0.9} color="#e6d0a8" />
      
      <ambientLight intensity={0.6} color="#ffffff" />
    </>
  );
}

export interface RealisticClothHeroSceneProps {
  config: HeroQualityConfig;
  visible: boolean;
}

export function RealisticClothHeroScene({
  config,
  visible,
}: RealisticClothHeroSceneProps) {
  const rigRef = useRef<THREE.Group>(null);
  
  const cameraPosition = useMemo(() => {
    if (typeof window === "undefined") return [1, 0.2, 5.5] as const;
    const isMobile = window.innerWidth < 768;
    return isMobile ? [1.1, 0.4, 4.8] : [1, 0.2, 5.5];
  }, []);

  return (
    <HeroSceneContext.Provider value={{ config, visible }}>
      <Canvas
        camera={{
          position: cameraPosition as [number, number, number],
          fov: 50,
          near: 0.1,
          far: 20,
        }}
        dpr={[1, config.maxDpr]}
        frameloop={visible ? "always" : "never"}
        performance={{
          min: config.performanceMin,
          max: config.performanceMax,
          debounce: config.performanceDebounce,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
          gl.setClearColor("#0A1F5C", 1);
        }}
        gl={{
          antialias: config.antialias,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
        }}
        className="touch-none"
      >
        <Suspense fallback={null}>
          <StudioLights />
          <group ref={rigRef}>
            <PremiumFabricHero />
          </group>
        </Suspense>
      </Canvas>
    </HeroSceneContext.Provider>
  );
}
export default RealisticClothHeroScene;
