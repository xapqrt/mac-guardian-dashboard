import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface BlackHole3DProps {
  isPurging?: boolean;
  activityLevel?: number; // 0 to 1 based on CPU load
  className?: string;
}

export const BlackHole3D: React.FC<BlackHole3DProps> = ({
  isPurging = false,
  activityLevel = 0.5,
  className = ''
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const surgeRef = useRef(0);

  useEffect(() => {
    if (isPurging) {
      surgeRef.current = 1.0;
    }
  }, [isPurging]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 260;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 32);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Black Hole Singularity Sphere (Pitch black core)
    const coreGeometry = new THREE.SphereGeometry(3.6, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
    });
    const singularity = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(singularity);

    // 2. Photon Ring / Event Horizon Glow
    const photonRingGeo = new THREE.RingGeometry(3.65, 4.4, 64);
    const photonRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const photonRing = new THREE.Mesh(photonRingGeo, photonRingMat);
    photonRing.rotation.x = Math.PI / 2;
    scene.add(photonRing);

    // 3. Accretion Disk Particles (Spiral Vortex)
    const particleCount = 4500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const angles = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);

    const color1 = new THREE.Color(0x38bdf8); // Sky blue
    const color2 = new THREE.Color(0xa855f7); // Purple
    const color3 = new THREE.Color(0xec4899); // Magenta
    const colorCore = new THREE.Color(0xffffff); // Core white-hot

    for (let i = 0; i < particleCount; i++) {
      const radius = 4.2 + Math.pow(Math.random(), 1.8) * 16;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * (1.2 * (radius / 16));

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      angles[i] = angle;
      radii[i] = radius;
      speeds[i] = 0.015 + (1 / Math.sqrt(radius)) * 0.04;

      // Color gradient from white-hot near event horizon to purple/blue at edge
      const t = (radius - 4.2) / 16;
      let particleColor = new THREE.Color();
      if (t < 0.2) {
        particleColor.lerpColors(colorCore, color1, t / 0.2);
      } else if (t < 0.6) {
        particleColor.lerpColors(color1, color2, (t - 0.2) / 0.4);
      } else {
        particleColor.lerpColors(color2, color3, (t - 0.6) / 0.4);
      }

      colors[i * 3] = particleColor.r;
      colors[i * 3 + 1] = particleColor.g;
      colors[i * 3 + 2] = particleColor.b;
    }

    const diskGeometry = new THREE.BufferGeometry();
    diskGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    diskGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle sprite using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(255,255,255,0.7)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const diskMaterial = new THREE.PointsMaterial({
      size: 0.42,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const accretionDisk = new THREE.Points(diskGeometry, diskMaterial);
    scene.add(accretionDisk);

    // 4. Relativistic Jets (Shooting out north and south poles)
    const jetCount = 800;
    const jetPositions = new Float32Array(jetCount * 3);
    const jetColors = new Float32Array(jetCount * 3);

    for (let i = 0; i < jetCount; i++) {
      const isNorth = i % 2 === 0;
      const dist = Math.random() * 22 + 2;
      const spread = (dist / 22) * 1.5;
      const angle = Math.random() * Math.PI * 2;

      jetPositions[i * 3] = Math.cos(angle) * Math.random() * spread;
      jetPositions[i * 3 + 1] = isNorth ? dist : -dist;
      jetPositions[i * 3 + 2] = Math.sin(angle) * Math.random() * spread;

      const alpha = 1.0 - (dist / 24);
      jetColors[i * 3] = 0.4 * alpha;
      jetColors[i * 3 + 1] = 0.8 * alpha;
      jetColors[i * 3 + 2] = 1.0 * alpha;
    }

    const jetGeometry = new THREE.BufferGeometry();
    jetGeometry.setAttribute('position', new THREE.BufferAttribute(jetPositions, 3));
    jetGeometry.setAttribute('color', new THREE.BufferAttribute(jetColors, 3));

    const jetMaterial = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const jets = new THREE.Points(jetGeometry, jetMaterial);
    scene.add(jets);

    // Tilt angle of the system
    scene.rotation.x = 0.45;
    scene.rotation.z = -0.2;

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    const posAttr = diskGeometry.attributes.position as THREE.BufferAttribute;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Decay surge
      if (surgeRef.current > 0.01) {
        surgeRef.current *= 0.96;
      } else {
        surgeRef.current = 0;
      }

      const speedMultiplier = 1.0 + activityLevel * 1.5 + surgeRef.current * 4.0;

      // Rotate particles in spiral accretion disk
      const posArray = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        angles[i] += speeds[i] * 0.02 * speedMultiplier;
        const r = radii[i];
        posArray[i * 3] = Math.cos(angles[i]) * r;
        posArray[i * 3 + 2] = Math.sin(angles[i]) * r;
      }
      posAttr.needsUpdate = true;

      // Pulse Photon Ring
      const pulse = Math.sin(Date.now() * 0.003) * 0.15 + (surgeRef.current * 0.5);
      photonRing.scale.set(1 + pulse, 1 + pulse, 1);
      photonRingMat.opacity = 0.75 + pulse * 0.4;

      // Rotate Jets
      jets.rotation.y += 0.015 * speedMultiplier;

      // Interactive gentle mouse tilt
      targetX += (mouseX * 0.5 - targetX) * 0.05;
      targetY += (mouseY * 0.3 - targetY) * 0.05;
      scene.rotation.y = targetX;
      scene.rotation.x = 0.45 + targetY;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      diskGeometry.dispose();
      diskMaterial.dispose();
      jetGeometry.dispose();
      jetMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      photonRingGeo.dispose();
      photonRingMat.dispose();
    };
  }, [activityLevel]);

  return (
    <div
      ref={mountRef}
      className={`relative overflow-hidden pointer-events-none select-none ${className}`}
    />
  );
};
