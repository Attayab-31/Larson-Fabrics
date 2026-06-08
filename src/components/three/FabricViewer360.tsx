import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import * as THREE from "three";

function FabricCylinder({
  fabricColor,
  fabricImage,
  isInteracting,
  setIsInteracting,
}: {
  fabricColor: string;
  fabricImage?: string;
  isInteracting: boolean;
  setIsInteracting: (b: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (fabricImage) {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      loader.load(
        fabricImage,
        (tex) => {
          // Set standard wrap properties for seamless repeat
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          // Repeat the image as a pattern across the fabric weave
          tex.repeat.set(1.5, 1.2);
          tex.needsUpdate = true;
          setTexture(tex);
        },
        undefined,
        (err) => {
          console.warn("Could not load texture from original product image, falling back to procedural tinting:", err);
          setTexture(null);
        }
      );
    } else {
      setTexture(null);
    }
  }, [fabricImage]);

  useFrame(() => {
    if (meshRef.current && !isInteracting) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <>
      <mesh ref={meshRef} scale={[1.1, 2.8, 1.1]} position={[0, 0, 0]}>
        <cylinderGeometry args={[1, 1, 3, 64, 32]} />
        <meshPhysicalMaterial
          map={texture || undefined}
          // Multiply color tint with original fabric texture for high fidelity custom dyes!
          color={texture ? "#ffffff" : fabricColor}
          metalness={0.05}
          roughness={0.55}
          sheen={0.9}
          sheenRoughness={0.4}
          sheenColor={fabricColor}
          clearcoat={0.15}
        />
      </mesh>

      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 10, 5]} intensity={1.3} />
      <directionalLight position={[-5, 5, -5]} intensity={0.65} color="#ffffff" />
      <pointLight position={[0, -2, 3]} intensity={0.6} />
    </>
  );
}

export function FabricViewer360({
  fabricColor = "#8B4513",
  fabricImage,
  onSwatchChange,
  swatches = [
    { name: "Coffee Brown", color: "#8B4513" },
    { name: "Navy Blue", color: "#082567" },
    { name: "Luxury Gold", color: "#D4AF37" },
    { name: "Imperial Ivory", color: "#F5F3EE" },
    { name: "Rich Crimson", color: "#9A1b1b" },
  ],
}: {
  fabricColor?: string;
  fabricImage?: string;
  onSwatchChange?: (swatchIndex: number) => void;
  swatches?: { name: string; color: string }[];
}) {
  const [currentColor, setCurrentColor] = useState(fabricColor);
  const [activeSwatchIndex, setActiveSwatchIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(true);

  // Sync state if prop changes
  useEffect(() => {
    setCurrentColor(fabricColor);
  }, [fabricColor]);

  useGSAP(
    () => {
      if (tooltipVisible) {
        gsap.to(".drag-tooltip", {
          opacity: 0,
          duration: 0.5,
          delay: 3.5,
          onComplete: () => setTooltipVisible(false),
        });
      }
    },
    { dependencies: [tooltipVisible] }
  );

  const handleSwatchClick = (index: number, color: string) => {
    setActiveSwatchIndex(index);
    setCurrentColor(color);
    onSwatchChange?.(index);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full h-[400px] sm:h-[550px] rounded-sm overflow-hidden bg-gradient-to-br from-navy-dark via-navy to-navy-mid border border-navy/15">
        <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }}>
          <FabricCylinder
            fabricColor={currentColor}
            fabricImage={fabricImage}
            isInteracting={isInteracting}
            setIsInteracting={setIsInteracting}
          />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableDamping={true}
            minDistance={2.5}
            maxDistance={7}
            onStart={() => setIsInteracting(true)}
            onEnd={() => setTimeout(() => setIsInteracting(false), 2000)}
          />
          <ContactShadows position={[0, -2.1, 0]} scale={5} blur={1.5} opacity={0.45} />
        </Canvas>

        {tooltipVisible && (
          <div className="drag-tooltip absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300">
            <div className="bg-navy/85 text-white px-5 py-2.5 rounded-sm font-body text-xs tracking-widest uppercase backdrop-blur-sm shadow-lg">
              Drag to Orbit 360° Fabric
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 font-body text-[10px] tracking-wider text-ivory/60">
          Scroll to zoom · Drag to spin unstitched fabric
        </div>
      </div>

      {swatches && swatches.length > 0 && (
        <div className="flex items-center gap-3 px-1">
          <span className="font-body text-xs uppercase tracking-[0.15em] text-navy-mid font-medium">
            Match coordinates:
          </span>
          <div className="flex flex-wrap gap-2">
            {swatches.map((swatch, idx) => (
              <button
                key={idx}
                onClick={() => handleSwatchClick(idx, swatch.color)}
                className={`relative w-8 h-8 rounded-full transition-all transform hover:scale-110 cursor-pointer ${
                  activeSwatchIndex === idx ? "ring-2 ring-gold ring-offset-2 scale-105" : ""
                }`}
                style={{ backgroundColor: swatch.color }}
                title={swatch.name}
                aria-label={`Select ${swatch.name} color`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default FabricViewer360;
