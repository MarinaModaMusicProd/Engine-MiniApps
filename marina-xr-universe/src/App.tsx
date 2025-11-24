import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, VRButton, ARButton, XRButton } from '@react-three/xr';
import { OrbitControls, Environment, Loader } from '@react-three/drei';
import { useXR } from './contexts/XRContext';
import { useAudio } from './contexts/AudioContext';
import Scene from './scenes/Scene';
import UI from './components/UI';
import './App.css';

const App: React.FC = () => {
  const { isVR, isAR, isPresenting, session } = useXR();
  const { isPlaying, currentTrack } = useAudio();

  // Toggle between VR/AR/Desktop modes
  const toggleXR = (mode: 'vr' | 'ar' | 'none') => {
    if (mode === 'vr' && !isVR) {
      // Enter VR mode
      document.body.appendChild(VRButton.createButton(document.querySelector('canvas')!));
    } else if (mode === 'ar' && !isAR) {
      // Enter AR mode
      document.body.appendChild(ARButton.createButton(document.querySelector('canvas')!));
    } else if (isPresenting) {
      // Exit XR
      session?.end();
    }
  };

  return (
    <div className="app">
      {/* Main 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1.6, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        shadows
      >
        <XR>
          <Suspense fallback={null}>
            <Scene />
            <Environment preset="city" />
            {!isPresenting && <OrbitControls />}
          </Suspense>
        </XR>
      </Canvas>

      {/* UI Overlay */}
      <UI 
        isPlaying={isPlaying}
        currentTrack={currentTrack}
        isXRPresenting={isPresenting}
        onToggleXR={toggleXR}
      />

      {/* Loading indicator */}
      <Loader
        containerStyles={{ background: '#000' }}
        innerStyles={{ color: '#9f7aea' }}
        barStyles={{ background: '#9f7aea' }}
        dataStyles={{ color: '#fff' }}
      />
    </div>
  );
};

export default App;
