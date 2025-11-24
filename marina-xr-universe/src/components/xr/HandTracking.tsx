import React, { useRef, useEffect } from 'react';
import { useXR, useFrame } from '@react-three/xr';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface HandTrackingProps {
  hand: XRHandedness;
  onPinchStart?: (hand: XRHandedness) => void;
  onPinchEnd?: (hand: XRHandedness) => void;
  onGrab?: (hand: XRHandedness, position: THREE.Vector3) => void;
}

const HandTracking: React.FC<HandTrackingProps> = ({
  hand,
  onPinchStart,
  onPinchEnd,
  onGrab,
}) => {
  const { isHandTracking } = useXR();
  const { gl } = useThree();
  const handRef = useRef<THREE.Group>(null);
  const isPinchingRef = useRef(false);
  
  // Hand joint mapping for visualization
  const jointMesh = useRef<{ [key: string]: THREE.Mesh }>({});
  const jointGeometry = useRef<THREE.BufferGeometry>(
    new THREE.SphereGeometry(0.01, 8, 8)
  );
  const jointMaterial = useRef<THREE.MeshBasicMaterial>(
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  );
  
  // Initialize hand joints
  useEffect(() => {
    if (!isHandTracking) return;
    
    const handModel = gl.xr.getHand(hand);
    const joints = [
      'wrist',
      'thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip',
      'index-finger-metacarpal', 'index-finger-phalanx-proximal', 'index-finger-phalanx-intermediate', 'index-finger-phalanx-distal', 'index-finger-tip',
      'middle-finger-metacarpal', 'middle-finger-phalanx-proximal', 'middle-finger-phalanx-intermediate', 'middle-finger-phalanx-distal', 'middle-finger-tip',
      'ring-finger-metacarpal', 'ring-finger-phalanx-proximal', 'ring-finger-phalanx-intermediate', 'ring-finger-phalanx-distal', 'ring-finger-tip',
      'pinky-finger-metacarpal', 'pinky-finger-phalanx-proximal', 'pinky-finger-phalanx-intermediate', 'pinky-finger-phalanx-distal', 'pinky-finger-tip'
    ];
    
    joints.forEach(jointName => {
      if (!jointMesh.current[jointName] && handRef.current) {
        const mesh = new THREE.Mesh(jointGeometry.current, jointMaterial.current);
        mesh.visible = false;
        jointMesh.current[jointName] = mesh;
        handRef.current.add(mesh);
      }
    });
    
    return () => {
      Object.values(jointMesh.current).forEach(mesh => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      });
    };
  }, [isHandTracking, gl.xr, hand]);
  
  // Update hand tracking
  useFrame(() => {
    if (!isHandTracking || !handRef.current) return;
    
    const handModel = gl.xr.getHand(hand);
    const joints = handModel.joints;
    
    // Update joint positions and visibility
    Object.entries(joints).forEach(([jointName, joint]) => {
      if (jointMesh.current[jointName] && joint.visible) {
        jointMesh.current[jointName].position.copy(joint.position);
        jointMesh.current[jointName].quaternion.copy(joint.quaternion);
        jointMesh.current[jointName].visible = true;
      } else if (jointMesh.current[jointName]) {
        jointMesh.current[jointName].visible = false;
      }
    });
    
    // Detect pinch gesture (thumb and index finger)
    if (joints['index-finger-tip']?.visible && joints['thumb-tip']?.visible) {
      const distance = joints['index-finger-tip'].position.distanceTo(
        joints['thumb-tip'].position
      );
      
      const isPinching = distance < 0.05; // 5cm threshold for pinch
      
      if (isPinching && !isPinchingRef.current) {
        isPinchingRef.current = true;
        if (onPinchStart) onPinchStart(hand);
        
        // Calculate grab position (midpoint between thumb and index)
        const grabPosition = new THREE.Vector3()
          .addVectors(
            joints['index-finger-tip'].position,
            joints['thumb-tip'].position
          )
          .multiplyScalar(0.5);
          
        if (onGrab) onGrab(hand, grabPosition);
      } else if (!isPinching && isPinchingRef.current) {
        isPinchingRef.current = false;
        if (onPinchEnd) onPinchEnd(hand);
      }
    } else if (isPinchingRef.current) {
      isPinchingRef.current = false;
      if (onPinchEnd) onPinchEnd(hand);
    }
  });
  
  return <group ref={handRef} />;
};

export default HandTracking;
