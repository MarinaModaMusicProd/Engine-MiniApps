import {defineConfig, Plugin} from 'vite';
import react from '@vitejs/plugin-react-swc';
import laravel from 'laravel-vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';
import replace from '@rollup/plugin-replace';
import * as fs from "fs";

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
  server: {
    host: 'dev-marina.tanya.city',
    hmr: {
      host: 'dev-marina.tanya.city',
    },
    https: {
      key: fs.readFileSync('/var/www/httpd-cert/dev-marina.tanya.city_2025-03-03-09-53_59.key'),
      cert: fs.readFileSync('/var/www/httpd-cert/dev-marina.tanya.city_2025-03-03-09-53_59.crt'),
    },
    port: 5173,
    watch: {
      ignored: ['**/node_modules/**', '**/vendor/**'],
    },
    cors: {
      origin: 'https://dev-marina.tanya.city',
    },
  },
  base: '',
  resolve: {
    preserveSymlinks: true,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      external: ['puppeteer', 'ioredis'],
    },
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
      "import { URL } from 'url'": false,
    }),
  ],


});
