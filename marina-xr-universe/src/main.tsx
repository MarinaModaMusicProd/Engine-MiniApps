import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Web3Modal } from '@web3modal/react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { XRProvider } from './contexts/XRContext';
import { AudioProvider } from './contexts/AudioContext';
import App from './App';
import './index.css';

// Configure chains & providers
const { publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [publicProvider()]
);

// Web3Modal configuration
const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

// Web3Modal project ID (replace with your own)
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// Root component
const Root = () => (
  <React.StrictMode>
    <WagmiConfig config={config}>
      <XRProvider>
        <AudioProvider>
          <Router>
            <App />
          </Router>
        </AudioProvider>
      </XRProvider>
    </WagmiConfig>
    <Web3Modal
      projectId={projectId}
      theme="dark"
      accentColor="#9f7aea"
      ethereum={{ appName: 'Marina Moda XR' }}
    />
  </React.StrictMode>
);

// Render the app
const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<Root />);
