import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAudio } from '../../contexts/AudioContext';

interface VisualizerProps {
  index: number;
  total: number;
  color?: string;
  height?: number;
}

const Visualizer: React.FC<VisualizerProps> = ({
  index,
  total,
  color = '#9f7aea',
  height = 2,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { getFrequencyData } = useAudio();
  
  // Calculate position in a circle
  const angle = (index / total) * Math.PI * 2;
  const radius = 4;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  
  // Create custom geometry for the visualizer bar
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(0.2, 0.1, 0.1);
    return geo;
  }, []);
  
  // Animation loop
  useFrame(() => {
    if (!meshRef.current) return;
    
    const frequencyData = getFrequencyData();
    if (!frequencyData) return;
    
    // Get frequency data for this bar
    const dataIndex = Math.floor((index / total) * frequencyData.length);
    const frequency = frequencyData[dataIndex] / 255;
    
    // Animate scale based on frequency
    const scaleY = 0.1 + frequency * height * 5;
    meshRef.current.scale.y = scaleY;
    
    // Add some rotation for visual interest
    meshRef.current.rotation.y += 0.01;
    
    // Pulsing color
    const colorIntensity = 0.5 + frequency * 0.5;
    (meshRef.current.material as THREE.MeshStandardMaterial).color.set(
      new THREE.Color(color).multiplyScalar(colorIntensity)
    );
  });
  
  return (
    <mesh
      ref={meshRef}
      position={[x, 0.05, z]}
      rotation={[0, -angle, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.2, 0.1, 0.1]} />
      <meshStandardMaterial 
        color={color}
        emissive={new THREE.Color(color).multiplyScalar(0.5)}
        metalness={0.8}
        roughness={0.2}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

export default Visualizer;
