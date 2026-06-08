import { useEffect, useRef } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "@/src/lib/motion";

export function FloatingFabricRollScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 200;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    camera.position.z = 3.5;

    const geometry = new THREE.CylinderGeometry(0.4, 0.4, 1.4, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.8,
      roughness: 0.15,
      bumpScale: 0.05,
    });
    const fabricRoll = new THREE.Mesh(geometry, material);
    fabricRoll.rotation.x = 0.5;
    fabricRoll.rotation.y = 0.5;
    scene.add(fabricRoll);

    const light1 = new THREE.DirectionalLight(0xffffff, 1.2);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xd4af37, 0.6);
    light2.position.set(-5, -5, -5);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    let animationId: number;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) * 0.001;

      fabricRoll.rotation.z = elapsed * 0.4;
      fabricRoll.rotation.x = 0.5 + Math.sin(elapsed * 0.25) * 0.2;
      fabricRoll.rotation.y = 0.5 + Math.cos(elapsed * 0.3) * 0.2;

      fabricRoll.position.y = Math.sin(elapsed * 0.45) * 0.15;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
