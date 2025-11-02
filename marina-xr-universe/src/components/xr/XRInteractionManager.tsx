import React, { useEffect, useRef } from 'react';
import { useXR, useFrame } from '@react-three/xr';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAudio } from '../../contexts/AudioContext';

interface XRInteractionManagerProps {
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
}

const XRInteractionManager: React.FC<XRInteractionManagerProps> = ({
  onSessionStart,
  onSessionEnd,
}) => {
  const { player, isPresenting } = useXR();
  const { camera } = useThree();
  const { isPlaying } = useAudio();
  const initialPosition = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.6, 5));
  
  // Handle XR session changes
  useEffect(() => {
    if (isPresenting) {
      // Save initial position when entering XR
      initialPosition.current.copy(camera.position);
      
      // Add haptic feedback to controllers
      const handleControllerConnected = (event: XRInputSourceEvent) => {
        const controller = event.inputSource;
        if (controller.hapticActuators && controller.hapticActuators[0]) {
          controller.hapticActuators[0].pulse(0.5, 100);
        }
      };
      
      window.addEventListener('connected', handleControllerConnected as EventListener);
      
      if (onSessionStart) onSessionStart();
      
      return () => {
        window.removeEventListener('connected', handleControllerConnected as EventListener);
        if (onSessionEnd) onSessionEnd();
      };
    }
  }, [isPresenting, camera.position, onSessionStart, onSessionEnd]);
  
  // Handle controller interactions
  useFrame(() => {
    if (!isPresenting) return;
    
    // Update controller positions and handle interactions
    // This is where you'd add raycasting and interaction logic
  });
  
  // Handle teleportation
  const handleTeleport = (position: THREE.Vector3) => {
    if (player) {
      player.position.copy(position);
    } else {
      camera.position.copy(position);
    }
  };
  
  return null;
};

export default XRInteractionManager;
