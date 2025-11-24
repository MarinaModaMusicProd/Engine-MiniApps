import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  coverArt: string;
  audioUrl: string;
  duration: number;
  bpm: number;
  key: string;
}

interface AudioContextType {
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  source: AudioBufferSourceNode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentTrack: AudioTrack | null;
  play: (track: AudioTrack) => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  getFrequencyData: () => Uint8Array | null;
  getTimeDomainData: () => Uint8Array | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Sample tracks (replace with actual tracks from Marina Moda's catalog)
const sampleTracks: AudioTrack[] = [
  {
    id: '1',
    title: 'Quantum Waves',
    artist: 'Marina Moda',
    coverArt: '/covers/quantum-waves.jpg',
    audioUrl: '/tracks/quantum-waves.mp3',
    duration: 237,
    bpm: 128,
    key: 'F# minor'
  },
  // Add more tracks as needed
];

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [source, setSource] = useState<AudioBufferSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  
  const animationFrameId = useRef<number>();
  const startTime = useRef<number>(0);
  const pauseTime = useRef<number>(0);
  
  // Initialize audio context and analyzer
  useEffect(() => {
    const initAudio = async () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const analyserNode = ctx.createAnalyser();
        analyserNode.fftSize = 2048;
        
        setAudioContext(ctx);
        setAnalyser(analyserNode);
        
        // Set a default track for demo purposes
        if (sampleTracks.length > 0) {
          setCurrentTrack(sampleTracks[0]);
        }
        
        return () => {
          if (source) {
            source.stop();
            source.disconnect();
          }
          analyserNode.disconnect();
          if (ctx.state !== 'closed') {
            ctx.close();
          }
        };
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };
    
    initAudio();
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);
  
  // Update current time when playing
  const updateTime = () => {
    if (isPlaying && audioContext) {
      const elapsed = audioContext.currentTime - startTime.current;
      setCurrentTime(elapsed);
      
      if (elapsed >= duration && duration > 0) {
        stop();
      } else {
        animationFrameId.current = requestAnimationFrame(updateTime);
      }
    }
  };
  
  // Start the animation loop when playing
  useEffect(() => {
    if (isPlaying) {
      animationFrameId.current = requestAnimationFrame(updateTime);
    }
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, currentTime]);
  
  // Play a track
  const play = async (track: AudioTrack) => {
    if (!audioContext || !analyser) return;
    
    try {
      // Stop current playback if any
      if (source) {
        source.stop();
        source.disconnect();
      }
      
      // Set up new audio source
      const response = await fetch(track.audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const src = audioContext.createBufferSource();
      src.buffer = audioBuffer;
      src.connect(analyser);
      analyser.connect(audioContext.destination);
      
      // Set up event handlers
      src.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        startTime.current = 0;
        pauseTime.current = 0;
      };
      
      // Start playback
      startTime.current = audioContext.currentTime - (pauseTime.current || 0);
      src.start(0, pauseTime.current || 0);
      
      setSource(src);
      setCurrentTrack(track);
      setDuration(track.duration);
      setIsPlaying(true);
      
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };
  
  // Pause playback
  const pause = () => {
    if (!audioContext || !source) return;
    
    source.stop();
    pauseTime.current = audioContext.currentTime - startTime.current;
    setIsPlaying(false);
  };
  
  // Stop playback
  const stop = () => {
    if (!source) return;
    
    source.stop();
    setCurrentTime(0);
    startTime.current = 0;
    pauseTime.current = 0;
    setIsPlaying(false);
  };
  
  // Seek to a specific time
  const seek = (time: number) => {
    if (!currentTrack) return;
    
    const seekTime = Math.max(0, Math.min(time, currentTrack.duration));
    
    if (isPlaying) {
      play(currentTrack);
    } else {
      pauseTime.current = seekTime;
      setCurrentTime(seekTime);
    }
  };
  
  // Get frequency data for visualization
  const getFrequencyData = (): Uint8Array | null => {
    if (!analyser) return null;
    
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencyData);
    return frequencyData;
  };
  
  // Get time domain data for visualization
  const getTimeDomainData = (): Uint8Array | null => {
    if (!analyser) return null;
    
    const timeDomainData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(timeDomainData);
    return timeDomainData;
  };
  
  return (
    <AudioContext.Provider
      value={{
        audioContext,
        analyser,
        source,
        isPlaying,
        currentTime,
        duration,
        currentTrack,
        play,
        pause,
        stop,
        seek,
        getFrequencyData,
        getTimeDomainData,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export default AudioContext;
