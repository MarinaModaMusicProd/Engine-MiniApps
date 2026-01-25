import {appQueries} from '@app/app-queries';
import {authGuard} from '@common/auth/guards/auth-route';
import {queryClient} from '@common/http/query-client';
import {RouteObject} from 'react-router';

export const backstageRoutes: RouteObject[] = [
  // Backstage request form
  {
    loader: () => authGuard({permission: 'backstageRequests.create'}),
    children: [
      {
        path: 'backstage/requests',
        lazy: () => import('@app/web-player/backstage/backstage-type-selector'),
      },
      {
        path: 'backstage/requests/verify-artist',
        lazy: () =>
          import(
            '@app/web-player/backstage/backstage-request-form/backstage-request-form-page'
          ),
      },
      {
        path: 'backstage/requests/become-artist',
        lazy: () =>
          import(
            '@app/web-player/backstage/backstage-request-form/backstage-request-form-page'
          ),
      },
      {
        path: 'backstage/requests/claim-artist',
        lazy: () =>
          import(
            '@app/web-player/backstage/backstage-request-form/backstage-request-form-page'
          ),
      },
      {
        path: 'backstage/requests/:requestId/request-submitted',
        lazy: () =>
          import('@app/web-player/backstage/backstage-request-submitted-page'),
      },
    ],
  },

  {
    path: 'backstage/upload',
    loader: () => authGuard({permission: 'music.create'}),
    lazy: () =>
      import('@app/web-player/backstage/upload-page/upload-page').then(
        ({BackstageUploadPage}) => ({Component: BackstageUploadPage}),
      ),
  },

  // Tracks
  {
    path: 'backstage/tracks/:trackId/edit',
    lazy: () =>
      import(
        '@app/admin/tracks-datatable-page/crupdate/update-track-page'
      ).then(({BackstageUpdateTrackPage}) => ({
        Component: BackstageUpdateTrackPage,
      })),
    loader: async ({params}) =>
      queryClient.ensureQueryData(
        appQueries.tracks.get(params.trackId!, 'editTrackPage'),
      ),
  },
  {
    path: 'backstage/tracks/:trackId/insights',
    lazy: () =>
      import(
        '@app/web-player/backstage/insights/backstage-track-insights'
      ).then(({NestedBackstageTrackInsights}) => ({
        Component: NestedBackstageTrackInsights,
      })),
    loader: async ({params}) =>
      queryClient.ensureQueryData(
        appQueries.tracks.get(params.trackId!, 'track'),
      ),
  },

  // Albums
  {
    path: 'backstage/albums/new',
    loader: () => authGuard({permission: 'music.create'}),
    lazy: () =>
      import('@app/admin/albums-datatable-page/create-album-page').then(
        ({BackstageCreateAlbumPage}) => ({Component: BackstageCreateAlbumPage}),
      ),
  },
  {
    path: 'backstage/albums/:albumId/edit',
    lazy: () =>
      import('@app/admin/albums-datatable-page/update-album-page').then(
        ({BackstageUpdateAlbumPage}) => ({Component: BackstageUpdateAlbumPage}),
      ),
    loader: async ({params}) =>
      queryClient.ensureQueryData(
        appQueries.albums.get(params.albumId!, 'editAlbumPage'),
      ),
  },
  {
    path: 'backstage/albums/:albumId/insights',
    lazy: () =>
      import(
        '@app/web-player/backstage/insights/backstage-album-insights'
      ).then(({BackstageAlbumInsights}) => ({
        Component: BackstageAlbumInsights,
      })),
    loader: async ({params}) => {
      queryClient.ensureQueryData(
        appQueries.albums.get(params.albumId!, 'album'),
      );
    },
  },

  // Artists
  {
    path: 'backstage/artists/:artistId/edit',
    lazy: () =>
      import('@app/admin/artist-datatable-page/update-artist-page').then(
        ({BackstageUpdateArtistPage}) => ({
          Component: BackstageUpdateArtistPage,
        }),
      ),
    loader: async ({params}) =>
      queryClient.ensureQueryData(
        appQueries.artists.show(params.artistId!).artist('editArtistPage'),
      ),
  },
  {
    path: 'backstage/artists/:artistId/insights',
    lazy: () =>
      import(
        '@app/web-player/backstage/insights/backstage-artist-insights'
      ).then(({BackstageArtistInsights}) => ({
        Component: BackstageArtistInsights,
      })),
    loader: async ({params}) => {
      queryClient.ensureQueryData(
        appQueries.artists.show(params.artistId!).artist('artist'),
      );
    },
  },
];
