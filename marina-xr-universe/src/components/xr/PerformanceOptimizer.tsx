import React, { useMemo, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PerformanceOptimizerProps {
  /** Target frames per second (default: 60) */
  targetFPS?: number;
  /** Whether to enable adaptive quality (default: true) */
  adaptiveQuality?: boolean;
  /** Minimum resolution scale (default: 0.5) */
  minResolutionScale?: number;
  /** Maximum resolution scale (default: 1) */
  maxResolutionScale?: number;
  /** Whether to show performance stats (default: false) */
  showStats?: boolean;
}

const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  targetFPS = 60,
  adaptiveQuality = true,
  minResolutionScale = 0.5,
  maxResolutionScale = 1,
  showStats = false,
}) => {
  const { gl, scene, camera, size } = useThree();
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const frameTimeRef = useRef(1000 / targetFPS);
  const lastFrameTimeRef = useRef(0);
  const resolutionScaleRef = useRef(maxResolutionScale);
  const statsRef = useRef<HTMLDivElement>(null);
  
  // Initialize performance monitoring
  useEffect(() => {
    if (!showStats || !statsRef.current) return;
    
    const statsElement = statsRef.current;
    statsElement.style.position = 'fixed';
    statsElement.style.bottom = '10px';
    statsElement.style.right = '10px';
    statsElement.style.color = 'white';
    statsElement.style.backgroundColor = 'rgba(0,0,0,0.5)';
    statsElement.style.padding = '10px';
    statsElement.style.fontFamily = 'monospace';
    statsElement.style.zIndex = '1000';
    
    document.body.appendChild(statsElement);
    
    return () => {
      if (document.body.contains(statsElement)) {
        document.body.removeChild(statsElement);
      }
    };
  }, [showStats]);
  
  // Adaptive resolution scaling
  useFrame(({ gl, camera }) => {
    const now = performance.now();
    const deltaTime = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;
    
    // Calculate frame time and adjust resolution scale
    if (adaptiveQuality) {
      const targetFrameTime = 1000 / targetFPS;
      const frameTimeRatio = deltaTime / targetFrameTime;
      
      // Adjust resolution scale based on performance
      if (frameTimeRatio > 1.1) {
        // Performance is worse than target, reduce quality
        resolutionScaleRef.current = Math.max(
          minResolutionScale,
          resolutionScaleRef.current * 0.95
        );
      } else if (frameTimeRatio < 0.9) {
        // Performance is better than target, increase quality
        resolutionScaleRef.current = Math.min(
          maxResolutionScale,
          resolutionScaleRef.current * 1.05
        );
      }
      
      // Apply resolution scaling
      const width = Math.floor(size.width * resolutionScaleRef.current);
      const height = Math.floor(size.height * resolutionScaleRef.current);
      
      if (gl.domElement.width !== width || gl.domElement.height !== height) {
        gl.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    }
    
    // Update stats display
    if (showStats && statsRef.current) {
      const fps = Math.round(1000 / deltaTime);
      const resolution = `${Math.floor(size.width * resolutionScaleRef.current)}x${Math.floor(size.height * resolutionScaleRef.current)}`;
      statsRef.current.innerHTML = `
        FPS: ${fps}<br>
        Resolution: ${resolution}<br>
        Scale: ${resolutionScaleRef.current.toFixed(2)}x
      `;
    }
  });
  
  // LOD (Level of Detail) management
  const lodLevels = useMemo(() => [
    { distance: 0, detail: 3 },
    { distance: 10, detail: 2 },
    { distance: 20, detail: 1 },
    { distance: 30, detail: 0.5 },
  ], []);
  
  // Memoize expensive calculations
  const memoizedScene = useMemo(() => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          // Add performance-related props to child components
          lodLevels,
          resolutionScale: resolutionScaleRef.current,
        });
      }
      return child;
    });
  }, [children, lodLevels]);
  
  return (
    <>
      {memoizedScene}
      {showStats && <div ref={statsRef} style={{ display: 'none' }} />}
    </>
  );
};

export default PerformanceOptimizer;
