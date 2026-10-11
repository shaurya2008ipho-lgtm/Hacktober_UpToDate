import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function OrbitalCore() {
  const core = useRef();
  const rings = useRef();
  useFrame((_, delta) => {
    if (core.current) {
      core.current.rotation.x += delta * 0.09;
      core.current.rotation.y += delta * 0.15;
    }
    if (rings.current) rings.current.rotation.z -= delta * 0.045;
  });
  return (
    <group>
      <group ref={core}>
        <mesh>
          <icosahedronGeometry args={[0.82, 2]} />
          <meshStandardMaterial color="#76f4d2" emissive="#0e997f" emissiveIntensity={0.8} roughness={0.25} metalness={0.5} wireframe />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.55, 1]} />
          <meshStandardMaterial color="#9eefff" emissive="#268cba" emissiveIntensity={0.65} wireframe />
        </mesh>
      </group>
      <group ref={rings}>
        <mesh rotation={[0.7, 0.25, 0.2]}>
          <torusGeometry args={[1.22, 0.009, 8, 140]} />
          <meshBasicMaterial color="#75e8ff" transparent opacity={0.9} />
        </mesh>
        <mesh rotation={[1.17, -0.35, 0.8]}>
          <torusGeometry args={[1.48, 0.006, 8, 140]} />
          <meshBasicMaterial color="#c6a6ff" transparent opacity={0.68} />
        </mesh>
      </group>
      {Array.from({ length: 28 }, (_, i) => {
        const angle = (i / 28) * Math.PI * 2;
        const radius = 1.7 + (i % 3) * 0.11;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle * 1.4) * 0.8, Math.sin(angle) * radius * 0.32]}>
            <sphereGeometry args={[i % 5 === 0 ? 0.035 : 0.015, 8, 8]} />
            <meshBasicMaterial color={i % 4 === 0 ? '#76f4d2' : '#6e86c9'} transparent opacity={0.85} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function OrbitalScene() {
  return (
    <div className="orbital-scene" aria-hidden="true">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 45 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.9} />
        <pointLight position={[3, 2, 4]} color="#80ffdf" intensity={12} />
        <pointLight position={[-3, -2, 1]} color="#8875ff" intensity={8} />
        <OrbitalCore />
      </Canvas>
    </div>
  );
}
