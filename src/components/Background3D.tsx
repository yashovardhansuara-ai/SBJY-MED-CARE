import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function LiquidSphere({ theme }: { theme?: 'light' | 'dark' }) {
  const sphereRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = clock.getElapsedTime() * 0.1;
      sphereRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });
  
  // Use a darker emerald (#064e3b) for dark mode, standard emerald (#059669) for light mode
  const sphereColor = theme === 'dark' ? '#064e3b' : '#059669';
  
  return (
    <Sphere ref={sphereRef} args={[1, 64, 64]} scale={2.5}>
      <MeshDistortMaterial
        color={sphereColor}
        emissive={theme === 'dark' ? '#064e3b' : '#000000'}
        emissiveIntensity={0.8}
        attach="material"
        distort={0.4}
        speed={1.5}
        roughness={0.2}
        metalness={0.8}
        wireframe={true}
      />
    </Sphere>
  );
}

export default function Background3D({ theme }: { theme?: 'light' | 'dark' }) {
  return (
    <div className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-700 ${theme === 'dark' ? 'opacity-80' : 'opacity-30'}`}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <LiquidSphere theme={theme} />
      </Canvas>
    </div>
  );
}
