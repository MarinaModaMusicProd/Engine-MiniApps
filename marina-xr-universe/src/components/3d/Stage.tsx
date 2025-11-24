import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';

interface StageProps {
  position?: [number, number, number];
  size?: [number, number, number];
  color?: string;
}

const Stage: React.FC<StageProps> = ({
  position = [0, 0, 0],
  size = [10, 0.5, 6],
  color = '#9f7aea',
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [width, height, depth] = size;
  
  // Load stage model (placeholder - in a real app, this would be a 3D model)
  // const { scene } = useGLTF('/models/stage.glb');
  
  // Animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Subtle floating animation
      groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
    }
  });

  return (
    <group position={position as [number, number, number]} ref={groupRef}>
      {/* Stage base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.3}
          roughness={0.7}
          emissive={new THREE.Color(color).multiplyScalar(0.2)}
        />
      </mesh>
      
      {/* Stage front */}
      <mesh 
        position={[0, -height/2, depth/2 + 0.1]} 
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[width, height * 2, 1]} />
        <meshStandardMaterial 
          color="#000000" 
          side={THREE.DoubleSide}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Stage decorations */}
      <group position={[0, height/2 + 0.05, 0]}>
        {/* Stage lights */}
        {[-3, -1.5, 0, 1.5, 3].map((x) => (
          <pointLight 
            key={`light-${x}`}
            position={[x, 1, -depth/2 + 0.5]}
            intensity={1}
            distance={6}
            color="#9f7aea"
            castShadow
          />
        ))}
        
        {/* Stage name */}
        <Text
          position={[0, 1.5, -depth/2 + 0.1]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          MARINA MODA
        </Text>
      </group>
      
      {/* Speaker towers */}
      <SpeakerTower position={[width/2 + 0.5, 0, 0]} />
      <SpeakerTower position={[-width/2 - 0.5, 0, 0]} rotation={[0, Math.PI, 0]} />
    </group>
  );
};

// Speaker tower component
const SpeakerTower: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
}> = ({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0] 
}) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Speaker base */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.8, 1, 3, 8]} />
        <meshStandardMaterial 
          color="#333333" 
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      {/* Speaker cone */}
      <mesh position={[0, 2.8, 0.5]} castShadow>
        <cylinderGeometry args={[0.6, 0.8, 0.2, 16]} />
        <meshStandardMaterial 
          color="#111111" 
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Speaker stand */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 0.4, 6} />
        <meshStandardMaterial 
          color="#222222" 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
};

export default Stage;
