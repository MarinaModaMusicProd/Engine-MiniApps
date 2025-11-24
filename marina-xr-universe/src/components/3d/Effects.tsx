import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAudio } from '../../contexts/AudioContext';

// Custom shader for audio-reactive particles
const particleVertexShader = `
  attribute float size;
  attribute vec3 customColor;
  varying vec3 vColor;
  
  void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragmentShader = `
  uniform sampler2D pointTexture;
  varying vec3 vColor;
  
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
    gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
    if (gl_FragColor.a < 0.5) discard;
  }
`;

const Effects: React.FC = () => {
  const { getFrequencyData } = useAudio();
  const particlesRef = useRef<THREE.Points>(null);
  const { size } = useThree();
  
  // Create particles
  const { positions, colors, sizes } = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const radius = 10;
    
    for (let i = 0; i < count; i++) {
      // Position particles in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random()) * radius;
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      // Random colors with purple tint
      colors[i * 3] = 0.5 + Math.random() * 0.5;     // R
      colors[i * 3 + 1] = 0.3 + Math.random() * 0.3; // G
      colors[i * 3 + 2] = 0.7 + Math.random() * 0.3; // B
      
      // Random sizes
      sizes[i] = 1 + Math.random() * 3;
    }
    
    return { positions, colors, sizes };
  }, []);
  
  // Animation loop
  useFrame(({ clock }) => {
    if (!particlesRef.current) return;
    
    const frequencyData = getFrequencyData();
    if (!frequencyData) return;
    
    const particles = particlesRef.current.geometry.attributes;
    const time = clock.getElapsedTime();
    
    // Animate particles based on audio
    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;
      const freqIndex = Math.floor((i % frequencyData.length) * 0.5);
      const frequency = frequencyData[freqIndex] / 255;
      
      // Base movement
      const speed = 0.2 + frequency * 0.5;
      const angle = time * speed + i * 0.01;
      
      // Update positions with audio reactivity
      particles.position.array[i3] = positions[i3] * (1 + Math.sin(angle) * frequency * 0.5);
      particles.position.array[i3 + 1] = positions[i3 + 1] * (1 + Math.cos(angle * 0.7) * frequency * 0.3);
      particles.position.array[i3 + 2] = positions[i3 + 2] * (1 + Math.sin(angle * 1.3) * frequency * 0.4);
      
      // Pulsing effect with music
      if (i % 20 === 0) {
        particles.size.array[i] = sizes[i] * (1 + frequency * 5);
      }
    }
    
    particles.position.needsUpdate = true;
    particles.size.needsUpdate = true;
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-customColor"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        uniforms={{
          pointTexture: { value: createParticleTexture() },
        }}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Helper function to create particle texture
function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  
  const context = canvas.getContext('2d');
  if (!context) return new THREE.Texture();
  
  const gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2
  );
  
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(200,200,255,0.8)');
  gradient.addColorStop(0.4, 'rgba(160,160,255,0.6)');
  gradient.addColorStop(0.6, 'rgba(120,120,255,0.4)');
  gradient.addColorStop(1, 'rgba(80,80,255,0)');
  
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default Effects;
