import replace from '@rollup/plugin-replace';
import react from '@vitejs/plugin-react-swc';
import laravel from 'laravel-vite-plugin';
import {defineConfig, Plugin} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';

// override laravel plugin base option (from absolute to relative to html base tag)
function basePath(): Plugin {
  return {
    name: 'test',
    enforce: 'post',
    config: () => {
      return {
        base: '',
      };
    },
  };
}

export default defineConfig({
  base: '',
  resolve: {
    preserveSymlinks: true,
  },
  build: {
    sourcemap: true,
  },
  plugins: [
    tsconfigPaths(),
    react(),
    laravel({
      input: ['resources/client/main.tsx'],
      refresh: false,
    }),
    basePath(),
    replace({
      preventAssignment: true,
      __SENTRY_DEBUG__: false,
    }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'resources/client',
      mode: 'development',
      filename: 'sw.ts',
      minify: false,
      manifest: false,
      injectRegister: false,
      buildBase: '/build/',
      scope: '/',
      base: '/',

      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
      },

      includeAssets: [],

      workbox: {
        // Add all the assets built by Vite into the public/build/assets
        // folder to the SW cache.
        globPatterns: ['**/*.{js,css,html,ico,jpg,png,svg,woff,woff2,ttf,eot}'],

        navigateFallback: '/',

        // Stops various paths being intercepted by the service worker
        // if they're not available offline. Telescope is a good
        // example, if you are using that.
        navigateFallbackDenylist: [/^\/telescope/],

        // Add some explicit URLs to the SW precache. This helps us
        // work with the laravel/vite-plugin setup.
        additionalManifestEntries: [
          // Cache the root URL to get hold of the PWA HTML entrypoint
          // defined in welcome.blade.php. Ref:
          // https://github.com/vite-pwa/vite-plugin-pwa/issues/431#issuecomment-1703151065
          {url: '/', revision: `${Date.now()}`},
          {url: '/manifest.json', revision: `${Date.now()}`},
        ],

        maximumFileSizeToCacheInBytes: 3000000, // 3MB
      },
    }),
  ],
});
