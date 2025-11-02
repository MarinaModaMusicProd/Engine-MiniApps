import React, { createContext, useContext, useEffect, useState } from 'react';
import { useXR } from '@react-three/xr';

interface XRContextType {
  isVR: boolean;
  isAR: boolean;
  isPresenting: boolean;
  session: XRSession | null;
  setSession: (session: XRSession | null) => void;
  xrMode: 'none' | 'vr' | 'ar';
  setXrMode: (mode: 'none' | 'vr' | 'ar') => void;
}

const XRContext = createContext<XRContextType | undefined>(undefined);

export const XRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<XRSession | null>(null);
  const [xrMode, setXrMode] = useState<'none' | 'vr' | 'ar'>('none');
  const xr = useXR();

  useEffect(() => {
    if (xr.isPresenting) {
      setSession(xr.session);
      setXrMode(xr.isAR ? 'ar' : 'vr');
    } else {
      setSession(null);
      setXrMode('none');
    }
  }, [xr.isPresenting, xr.session, xr.isAR]);

  return (
    <XRContext.Provider
      value={{
        isVR: xr.isVR,
        isAR: xr.isAR,
        isPresenting: xr.isPresenting,
        session,
        setSession,
        xrMode,
        setXrMode,
      }}
    >
      {children}
    </XRContext.Provider>
  );
};

export const useXRContext = (): XRContextType => {
  const context = useContext(XRContext);
  if (context === undefined) {
    throw new Error('useXRContext must be used within an XRProvider');
  }
  return context;
};

export default XRContext;
