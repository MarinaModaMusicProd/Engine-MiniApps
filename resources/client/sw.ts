/// <reference lib="WebWorker" />

import type {DownloadedFile} from '@app/offline/playback-data-storage';
import {cacheNames, clientsClaim} from 'workbox-core';
import {
  cleanupOutdatedCaches,
  precacheAndRoute,
  PrecacheEntry,
} from 'workbox-precaching';
import {NavigationRoute, registerRoute} from 'workbox-routing';
import {NetworkOnly} from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

const manifestEntriesToSkip = [
  /\/swagger/,
  /\/ace-editor/,
  /\/worker-/,
  /\/dash-provider/,
  /\/hls-provider/,
  /\/lazy-chart/,
  /\/icon-list/,
  /\/article-editor/,
  /\/backstage-requests/,
  /\/billing-page/,
  /\/checkout-/,
  /\/contact-us/,
  /\/custom-page/,
  /\/assets\/settings-/,
  // all admin settings pages
  /\/[a-z]+-settings/,
  // all admin index pages
  /\/[a-z]+-index-page/,
  /\/[a-z]+-datatable/,
];

const manifest: PrecacheEntry[] = self.__WB_MANIFEST
  .map(e => {
    const entry = e as PrecacheEntry;
    return {
      ...entry,
      url: `build/${entry.url}`,
    };
  })
  .filter(e => !manifestEntriesToSkip.some(r => r.test(e.url)));

manifest.push({url: '/manifest.json', revision: null});

cleanupOutdatedCaches();
precacheAndRoute(manifest);

registerRoute(
  new NavigationRoute(
    new NetworkOnly({
      plugins: [
        {
          handlerDidError: async ({event, request, error}) => {
            const cache = await caches.open(cacheNames.runtime);
            const appShell = await cache.match('app-shell');
            if (appShell) {
              // notify app that we are offline if initial SPA navigation fails due to network error.
              // this is needed because react query online manager always starts as online and does not detect network errors on initial load.
              const html = await appShell.text();
              const modifiedHtml = html.replace(
                '<head>',
                '<head><script>window.beSwInitialIsOffline=true;</script>',
              );
              return new Response(modifiedHtml, {
                status: appShell.status,
                statusText: appShell.statusText,
                headers: appShell.headers,
              });
            }
            return Response.error();
          },
          fetchDidSucceed: async ({response, event}) => {
            // every time app shell is fetched, cache it, this will cache latest bootstrap data as well
            const clonedResponse = response.clone();
            event.waitUntil(
              caches
                .open(cacheNames.runtime)
                .then(cache => cache.put('app-shell', clonedResponse)),
            );
            return response;
          },
        },
      ],
    }),
    {
      denylist: [
        /^\/admin/,
        /^\/account-settings\//,
        /^\/contact\//,
        /^\/backstage\//,
        /^\/login\//,
        /^\/register\//,
        /^\/forgot-password\//,
        /^\/billing\//,
        /^\/checkout\//,
        /^\/pricing\//,
      ],
    },
  ),
);

// Handle offlined media streaming from OPFS
registerRoute(
  ({url}) => /stream\/offlined-media\/.*\.mp3/.test(url.pathname),
  async ({request}) => {
    const trackId = request.url.match(/stream\/offlined-media\/(.*)\.mp3/)?.[1];
    if (!trackId) {
      return Response.error();
    }
    return streamOfflinedMediaFromOpfs(trackId, request);
  },
);

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheNames.precache);
      const cachedRequests = await cache.keys();

      // Create a set of current manifest URLs for faster lookup
      const manifestUrls = new Set(
        manifest.map(entry => new URL(entry.url, self.location.origin).href),
      );

      // Delete cached files not in the current manifest
      await Promise.all(
        cachedRequests.map(async request => {
          if (!manifestUrls.has(request.url) && request.url !== '/') {
            await cache.delete(request);
          }
        }),
      );
    })(),
  );
});

async function streamOfflinedMediaFromOpfs(trackId: string, request: Request) {
  try {
    const entry = await getDownloadedFileEntry(trackId);
    if (!entry) return Response.error();

    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle('offline-playback-data');
    const fileHandle = await dir.getFileHandle(entry.name);
    const file = await fileHandle.getFile();

    const range = request.headers.get('range');
    if (!range) {
      return new Response(file, {
        headers: {
          'Content-Type': entry.contentType,
          'Content-Length': `${file.size}`,
        },
      });
    }

    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : file.size - 1;
    const chunksize = end - start + 1;

    const slicedFile = file.slice(start, end + 1);

    return new Response(slicedFile, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${file.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': `${chunksize}`,
        'Content-Type': entry.contentType,
      },
    });
  } catch (error) {
    console.error('Offline stream error:', error);
    return new Response('File not found', {status: 404});
  }
}

async function getDownloadedFileEntry(
  trackId: string | number,
): Promise<DownloadedFile | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('downloaded_files', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('files', 'readonly');
      const store = transaction.objectStore('files');
      const getRequest = store.get(+trackId);

      getRequest.onerror = () => {
        db.close();
        reject(getRequest.error);
      };

      getRequest.onsuccess = () => {
        db.close();
        resolve(getRequest.result ?? null);
      };
    };
  });
}

self.skipWaiting();
clientsClaim();
