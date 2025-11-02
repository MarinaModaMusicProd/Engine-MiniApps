import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useXR, Text } from '@react-three/drei';
import { useAudio } from '../contexts/AudioContext';
import { Vector3, Color } from 'three';
import Stage from '../components/3d/Stage';
import Visualizer from '../components/3d/Visualizer';
import Audience from '../components/3d/Audience';
import Effects from '../components/3d/Effects';

const Scene: React.FC = () => {
  const { camera } = useThree();
  const { isPresenting } = useXR();
  const { isPlaying, currentTrack, getFrequencyData } = useAudio();
  const visualizerRef = useRef<THREE.Group>(null);
  
  // Set up camera position based on XR mode
  useEffect(() => {
    if (!isPresenting) {
      camera.position.set(0, 1.6, 5);
      camera.lookAt(0, 1.6, 0);
    }
  }, [isPresenting, camera]);

  // Animation loop
  useFrame(({ clock }) => {
    if (visualizerRef.current && isPlaying) {
      // Update visualizer based on audio data
      const frequencyData = getFrequencyData();
      if (frequencyData) {
        // Animate visualizer elements based on frequency data
        visualizerRef.current.children.forEach((child, i) => {
          if (child.scale) {
            const scale = 1 + (frequencyData[i % frequencyData.length] / 255) * 2;
            child.scale.y = Math.max(0.1, scale);
          }
        });
      }
    }
  });

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#9f7aea" />
      
      {/* Main stage */}
      <Stage position={[0, 0, 0]} />
      
      {/* Audio visualizer */}
      <group ref={visualizerRef} position={[0, 0.5, 0]}>
        {Array.from({ length: 32 }).map((_, i) => (
          <Visualizer key={i} index={i} total={32} />
        ))}
      </group>
      
      {/* Audience area */}
      <Audience position={[0, 0, -5]} count={20} />
      
      {/* Visual effects */}
      {isPlaying && <Effects />}
      
      {/* Track info */}
      {currentTrack && (
        <Text
          position={[0, 4, -5]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {`${currentTrack.artist} - ${currentTrack.title}`}
        </Text>
      )}
      
      {/* Environment */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
};

export default Scene;
