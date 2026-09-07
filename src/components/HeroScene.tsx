import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RotatingPolyProps {
  reducedMotion: boolean;
}

const RotatingPoly: React.FC<RotatingPolyProps> = ({ reducedMotion }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetRotation = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (reducedMotion || !meshRef.current) return;

    // Slow ambient rotation
    meshRef.current.rotation.y += delta * 0.15;
    meshRef.current.rotation.x += delta * 0.08;

    // Gentle parallax mouse tilt (max ~8 degrees = ~0.14 radians)
    const maxTilt = 0.14;
    targetRotation.current.x = -state.pointer.y * maxTilt;
    targetRotation.current.y = state.pointer.x * maxTilt;

    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      meshRef.current.rotation.x + targetRotation.current.x * 0.02,
      0.05
    );
  });

  return (
    <group>
      {/* Outer Low-Poly Icosahedron wireframe */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.7, 1]} />
        <meshBasicMaterial
          wireframe
          color="#7C3AED"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Inner subtle cyan accent nucleus */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[0.9, 0]} />
        <meshBasicMaterial
          wireframe
          color="#22D3EE"
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
};

export const HeroScene: React.FC<{ className?: string }> = ({ className = '' }) => {
  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Background radial gradient spotlight to enhance the wireframe */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #7C3AED 0%, #22D3EE 40%, transparent 70%)'
        }}
      />

      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 4.5], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        style={{ width: '100%', height: '100%' }}
      >
        <RotatingPoly reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
};

export default HeroScene;
