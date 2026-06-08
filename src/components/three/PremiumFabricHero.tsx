import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useHeroScene } from "@/src/components/three/HeroSceneContext";

export function PremiumFabricHero() {
  const { visible, config } = useHeroScene();
  const meshRef = useRef<THREE.Mesh>(null);
  const rollGroupRef = useRef<THREE.Group>(null);
  const initialPositionsRef = useRef<Float32Array | null>(null);

  const viewportData = useMemo(() => {
    if (typeof window === "undefined") return { isMobile: false, aspectRatio: 16 / 9 };
    const isMobile = window.innerWidth < 768;
    const aspectRatio = window.innerHeight > 0 ? window.innerWidth / window.innerHeight : 16 / 9;
    return { isMobile, aspectRatio };
  }, []);

  const weavyTexture = useMemo(() => {
    const resolution = config.textureResolution;
    const canvas = document.createElement("canvas");
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Base premium cream/ivory
      ctx.fillStyle = "#f5f3ee";
      ctx.fillRect(0, 0, resolution, resolution);

      const scale = resolution / 2048;

      // Vertical and horizontal fine thread lines
      ctx.strokeStyle = "rgba(180, 165, 150, 0.18)";
      ctx.lineWidth = 1.0 * scale;
      const spacing = 8 * scale;

      for (let i = 0; i < resolution; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, resolution);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(resolution, i);
        ctx.stroke();
      }

      // Procedural diagonal weave simulation
      ctx.strokeStyle = "rgba(140, 120, 100, 0.08)";
      ctx.lineWidth = 1.5 * scale;
      for (let i = -resolution; i < resolution * 2; i += spacing * 2) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + resolution, resolution);
        ctx.stroke();
      }

      // Dynamic LARSON Branding Layer inside the fabric weave
      const textStr = "LARSON";
      const fontSize = 320 * scale;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillText(textStr, resolution / 2 + 10 * scale, resolution / 2 + 10 * scale);

      // Main print
      ctx.fillStyle = "rgba(10, 31, 92, 0.85)"; // Gold-tinged Navy
      ctx.fillText(textStr, resolution / 2, resolution / 2);

      // Accent Golden Stroke around print
      ctx.strokeStyle = "rgba(212, 175, 55, 0.9)";
      ctx.lineWidth = 8 * scale;
      ctx.strokeText(textStr, resolution / 2, resolution / 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
    tex.anisotropy = 8;
    return tex;
  }, [config.textureResolution]);

  const fabricMaterial = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        map: weavyTexture,
        color: 0xf5f3ee,
        shininess: 30,
        side: THREE.DoubleSide,
        flatShading: false,
      }),
    [weavyTexture]
  );

  const rollMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x1a3a8f,
        roughness: 0.2,
        metalness: 0.1,
      }),
    []
  );

  const fabricGeometry = useMemo(() => {
    const segments = config.clothSegments;
    const geom = new THREE.PlaneGeometry(3.5, 4.5, segments, segments);
    const positions = geom.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      
      const wave1 = Math.sin(x * 1.5) * Math.cos(y * 1.2) * 0.15;
      const wave2 = Math.cos(x * 1.2) * Math.sin(y * 1.6) * 0.12;
      
      positions[i + 2] = z + wave1 + wave2;
    }
    
    geom.attributes.position.needsUpdate = true;
    geom.computeVertexNormals();
    return geom;
  }, [config.clothSegments]);

  useFrame((state) => {
    if (!visible || !rollGroupRef.current) return;

    const t = state.clock.elapsedTime;
    const mesh = meshRef.current;

    rollGroupRef.current.position.y = Math.sin(t * 0.2) * 0.05;

    if (mesh && mesh.geometry) {
      const posAttr = mesh.geometry.attributes.position;
      const positions = posAttr.array as Float32Array;

      if (!initialPositionsRef.current) {
        initialPositionsRef.current = new Float32Array(positions);
      }

      const initialPos = initialPositionsRef.current;

      for (let i = 0; i < positions.length; i += 3) {
        const x = initialPos[i];
        const y = initialPos[i + 1];
        const z = initialPos[i + 2];

        // Complex undulating waves (simulating silk blowing in air)
        const horizontalWave = Math.sin(x * 2.2 + t * 1.8) * 0.12;
        const verticalWave = Math.cos(y * 1.6 + t * 2.1) * 0.15;
        const depthWave = Math.sin((x + y) * 1.4 + t * 2.4) * 0.08;

        positions[i] = x + horizontalWave * 0.15;
        positions[i + 1] = y + verticalWave * 0.15;
        positions[i + 2] = z + depthWave;
      }

      posAttr.needsUpdate = true;
      mesh.geometry.computeVertexNormals();

      mesh.rotation.z = Math.sin(t * 0.5) * 0.04;
      mesh.rotation.x = 0.12 + Math.cos(t * 0.4) * 0.03;
    }
  });

  const rollGeometries = useMemo(
    () => [
      new THREE.CylinderGeometry(0.3, 0.3, 1.8, 16),
      new THREE.CylinderGeometry(0.28, 0.28, 1.6, 16),
    ],
    []
  );

  return (
    <group>
      <group ref={rollGroupRef} position={[3.0, 1.2, -1.8]} scale={0.7} rotation={[0.4, -0.4, 0.2]}>
        <mesh
          geometry={rollGeometries[0]}
          material={rollMaterial}
          position={[-0.8, -0.2, 0]}
        />
        <mesh
          geometry={rollGeometries[1]}
          material={rollMaterial}
          position={[0.2, 0.4, -0.4]}
        />
      </group>

      <mesh
        ref={meshRef}
        geometry={fabricGeometry}
        material={fabricMaterial}
        position={[viewportData.isMobile ? 1.4 : 1.9, viewportData.isMobile ? 0.3 : -0.1, 0.2]}
        rotation={[0.15, -0.25, 0.05]}
        scale={viewportData.isMobile ? 0.9 : 1.0}
      />
    </group>
  );
}
