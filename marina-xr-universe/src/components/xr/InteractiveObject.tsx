import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface InteractiveObjectProps {
  position?: [number, number, number];
  color?: string;
  onGrab?: (object: THREE.Object3D) => void;
  onRelease?: (object: THREE.Object3D, velocity: THREE.Vector3) => void;
  onHover?: (object: THREE.Object3D) => void;
  onUnhover?: (object: THREE.Object3D) => void;
  children?: React.ReactNode;
  interactive?: boolean;
  physics?: boolean;
  mass?: number;
  shape?: 'box' | 'sphere' | 'cylinder';
  size?: [number, number, number];
}

const InteractiveObject: React.FC<InteractiveObjectProps> = ({
  position = [0, 1, 0],
  color = '#ff6b6b',
  onGrab,
  onRelease,
  onHover,
  onUnhover,
  children,
  interactive = true,
  physics = true,
  mass = 1,
  shape = 'box',
  size = [0.2, 0.2, 0.2],
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isGrabbed, setIsGrabbed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [initialPosition] = useState<THREE.Vector3>(
    new THREE.Vector3(...position)
  );
  const [velocity] = useState<THREE.Vector3>(new THREE.Vector3());
  const [angularVelocity] = useState<THREE.Vector3>(new THREE.Vector3());
  const [lastPosition] = useState<THREE.Vector3>(new THREE.Vector3());
  const [lastQuaternion] = useState<THREE.Quaternion>(new THREE.Quaternion());
  
  const { raycaster, mouse } = useThree();
  const clock = useRef(new THREE.Clock());
  const isDragging = useRef(false);
  const grabPoint = useRef<THREE.Vector3>(new THREE.Vector3());
  const grabOffset = useRef<THREE.Vector3>(new THREE.Vector3());
  const grabRotation = useRef<THREE.Quaternion>(new THREE.Quaternion());
  
  // Handle physics
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const delta = clock.current.getDelta();
    
    if (isGrabbed) {
      // Update position based on grab point
      if (grabPoint.current && meshRef.current) {
        const targetPosition = grabPoint.current.clone().add(grabOffset.current);
        meshRef.current.position.lerp(targetPosition, 0.2);
        
        // Smooth rotation
        if (grabRotation.current) {
          meshRef.current.quaternion.slerp(grabRotation.current, 0.2);
        }
      }
    } else if (physics) {
      // Apply gravity
      velocity.y -= 9.8 * delta * mass;
      
      // Update position based on velocity
      meshRef.current.position.add(
        new THREE.Vector3().copy(velocity).multiplyScalar(delta)
      );
      
      // Update rotation based on angular velocity
      if (angularVelocity.lengthSq() > 0) {
        const rotationAxis = new THREE.Vector3().copy(angularVelocity).normalize();
        const rotationAngle = angularVelocity.length() * delta;
        meshRef.current.rotateOnAxis(rotationAxis, rotationAngle);
        
        // Dampen angular velocity
        angularVelocity.multiplyScalar(0.95);
      }
      
      // Simple ground collision
      if (meshRef.current.position.y < size[1] / 2) {
        meshRef.current.position.y = size[1] / 2;
        velocity.y *= -0.5; // Bounce
        velocity.multiplyScalar(0.9); // Friction
      }
      
      // Air resistance
      velocity.multiplyScalar(0.99);
    }
    
    // Update velocity based on position change
    if (lastPosition && meshRef.current) {
      const newVelocity = meshRef.current.position
        .clone()
        .sub(lastPosition)
        .divideScalar(delta || 0.0001);
      
      // Update angular velocity based on rotation change
      if (lastQuaternion && meshRef.current.quaternion) {
        const deltaQ = meshRef.current.quaternion
          .clone()
          .multiply(lastQuaternion.clone().inverse());
        
        if (deltaQ.w < 1) {
          const angle = 2 * Math.acos(deltaQ.w);
          const axis = new THREE.Vector3(deltaQ.x, deltaQ.y, deltaQ.z).normalize();
          angularVelocity.copy(axis.multiplyScalar(angle / (delta || 0.0001)));
        }
      }
      
      lastPosition.copy(meshRef.current.position);
      lastQuaternion.copy(meshRef.current.quaternion);
    }
  });
  
  // Handle grab
  const handleGrab = (grabPosition: THREE.Vector3, handQuaternion?: THREE.Quaternion) => {
    if (!meshRef.current || !interactive) return;
    
    setIsGrabbed(true);
    grabPoint.current.copy(grabPosition);
    grabOffset.current
      .copy(meshRef.current.position)
      .sub(grabPosition);
    
    if (handQuaternion) {
      grabRotation.current.copy(handQuaternion);
    } else {
      grabRotation.current.identity();
    }
    
    if (onGrab) onGrab(meshRef.current);
  };
  
  // Handle release
  const handleRelease = () => {
    if (!meshRef.current || !isGrabbed) return;
    
    setIsGrabbed(false);
    
    // Calculate throw velocity
    const currentVelocity = meshRef.current.position
      .clone()
      .sub(lastPosition)
      .divideScalar(clock.current.getDelta() || 0.0001);
    
    if (onRelease) onRelease(meshRef.current, currentVelocity);
  };
  
  // Handle hover
  const handlePointerOver = () => {
    if (!interactive) return;
    
    setIsHovered(true);
    if (onHover && meshRef.current) onHover(meshRef.current);
  };
  
  // Handle unhover
  const handlePointerOut = () => {
    if (!interactive) return;
    
    setIsHovered(false);
    if (onUnhover && meshRef.current) onUnhover(meshRef.current);
  };
  
  // Create geometry based on shape
  const getGeometry = () => {
    switch (shape) {
      case 'sphere':
        return <sphereGeometry args={[size[0], 16, 16]} />;
      case 'cylinder':
        return <cylinderGeometry args={[size[0], size[0], size[1], 16]} />;
      case 'box':
      default:
        return <boxGeometry args={size} />;
    }
  };
  
  return (
    <group>
      <mesh
        ref={meshRef}
        position={initialPosition}
        castShadow
        receiveShadow
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {getGeometry()}
        <meshStandardMaterial 
          color={isHovered ? new THREE.Color(color).offsetHSL(0, 0.2, 0.2) : color}
          metalness={0.8}
          roughness={0.2}
          emissive={isHovered ? color : '#000000'}
          emissiveIntensity={isHovered ? 0.5 : 0}
        />
        {children}
      </mesh>
      
      {/* Debug info */}
      {isHovered && (
        <Text
          position={[position[0], position[1] + size[1] + 0.2, position[2]]}
          fontSize={0.1}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {isGrabbed ? 'Grabbed' : 'Hovered'}
        </Text>
      )}
    </group>
  );
};

export default InteractiveObject;
