import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// written by @emielster

export const CastleBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a08);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 150;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      
      sizes[i] = Math.random() * 2;
      opacities[i] = Math.random() * 0.7 + 0.3;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xFFD700,
      size: 1.2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7
    });
    
    const particles = new THREE.Points(particlesGeo, particlesMaterial);
    scene.add(particles);

    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      //const _deltaTime = Math.min((now - lastFrameTime) / 1000, 0.016);

      const posAttr = particlesGeo.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += velocities[i * 3];
        posArray[i * 3 + 1] += velocities[i * 3 + 1];
        posArray[i * 3 + 2] += velocities[i * 3 + 2];

        if (posArray[i * 3] > 200) posArray[i * 3] = -200;
        if (posArray[i * 3] < -200) posArray[i * 3] = 200;
        if (posArray[i * 3 + 1] > 150) {
          posArray[i * 3 + 1] = -150;
          velocities[i * 3 + 1] = Math.abs(velocities[i * 3 + 1]);
        }
        if (posArray[i * 3 + 1] < -150) {
          posArray[i * 3 + 1] = 150;
          velocities[i * 3 + 1] = -Math.abs(velocities[i * 3 + 1]);
        }
        if (posArray[i * 3 + 2] > 100) posArray[i * 3 + 2] = -100;
        if (posArray[i * 3 + 2] < -100) posArray[i * 3 + 2] = 100;
      }
      posAttr.needsUpdate = true;

      particles.rotation.x += 0.00005;
      particles.rotation.y += 0.00008;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      const parent = renderer.domElement.parentNode;
      if (parent) parent.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />;
};
