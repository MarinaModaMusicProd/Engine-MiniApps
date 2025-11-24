import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [
    react(),
    glsl()
  ],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  optimizeDeps: {
    esbuildOptions: {
      // Enable esbuild's support for BigInt
      target: 'es2020',
      // Handle globalThis not being available in older browsers
      define: {
        global: 'globalThis',
      },
    },
  },
  define: {
    // Global constants
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
