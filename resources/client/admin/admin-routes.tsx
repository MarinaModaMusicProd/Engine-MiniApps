import {appQueries} from '@app/app-queries';
import {adminCustomPagesRoutes} from '@common/admin/custom-pages/admin-custom-pages-routes';
import {adminFileEntriesRoutes} from '@common/admin/file-entry/admin-file-entries-routes';
import {adminLogsRoutes} from '@common/admin/logging/admin-logs-routes';
import {adminRolesRoutes} from '@common/admin/roles/admin-roles-routes';
import {commonAdminSettingsRoutes} from '@common/admin/settings/common-admin-settings-routes';
import {adminBillingRoutes} from '@common/admin/subscriptions/admin-billing-routes';
import {adminTagsRoutes} from '@common/admin/tags/admin-tags-routes';
import {adminLocalizationsRoutes} from '@common/admin/translations/admin-localizations-routes';
import {adminUsersRoutes} from '@common/admin/users/admin-users-routes';
import {authGuard} from '@common/auth/guards/auth-route';
import {channelQueries} from '@common/channels/channel-queries';
import {validateChannelQueryParams} from '@common/channels/use-channel-query-params';
import {commentQueries} from '@common/comments/comment-queries';
import {shouldRevalidateDatatableLoader} from '@common/datatable/filters/utils/should-revalidate-datatable-loader';
import {queryClient} from '@common/http/query-client';
import {searchParamsFromUrl} from '@ui/utils/urls/search-params-from-url';
import {Navigate, RouteObject} from 'react-router';

export const adminRoutes: RouteObject[] = [
  {
    path: 'admin',
    loader: () => authGuard({permission: 'admin.access'}),
    lazy: () => import('@common/admin/admin-layout'),
    children: [
      {
        index: true,
        element: <Navigate to="reports" />,
      },
      {
        path: 'reports',
        lazy: () => import('@app/admin/reports/MarinaModa-admin-report-page'),
        children: [
          {
            index: true,
            lazy: () => import('@app/admin/reports/admin-insights-report'),
          },
          {
            path: 'plays',
            lazy: () => import('@app/admin/reports/admin-insights-report'),
          },
          {
            path: 'visitors',
            lazy: () => import('@app/admin/reports/admin-visitors-report'),
          },
        ],
      },
      ...Object.values(adminUsersRoutes),
      ...Object.values(adminRolesRoutes),
      ...Object.values(adminBillingRoutes),
      ...Object.values(adminCustomPagesRoutes),
      ...Object.values(adminTagsRoutes),
      ...Object.values(adminLocalizationsRoutes),
      ...Object.values(adminFileEntriesRoutes),
      ...Object.values(adminLogsRoutes),

      commonAdminSettingsRoutes(
        [
          {
            path: 'search',
            lazy: () =>
              import('@common/admin/settings/pages/search-settings/search-settings'),
          },
          {
            path: 'providers',
            lazy: () => import('@app/admin/settings/automation-settings'),
          },
          {
            path: 'player',
            lazy: () =>
              import('@app/admin/settings/player-settings/player-settings'),
          },
          {
            path: 'landing-page',
            lazy: () =>
              import('@app/admin/settings/landing-page-settings/landing-page-settings'),
          },
          {
            path: 'ads',
            lazy: () => import('@common/admin/settings/pages/ads-settings'),
          },
        ],
        {
          general: {
            lazy: () => import('@app/admin/settings/app-general-settings'),
          },
        },
      ),

      // Channels
      {
        path: 'channels',
        lazy: () => import('@common/admin/channels/channels-datatable-page'),
        shouldRevalidate: shouldRevalidateDatatableLoader,
        loader: ({request}) =>
          queryClient.ensureQueryData(
            channelQueries.index(searchParamsFromUrl(request.url)),
          ),
      },
      {
        path: 'channels/new',
        lazy: () => import('@app/admin/channels/create-channel-page'),
      },
      {
        path: 'channels/:slugOrId/edit',
        lazy: () => import('@app/admin/channels/edit-channel-page'),
        loader: async ({params, request}) =>
          queryClient.ensureQueryData(
            channelQueries.show(
              params.slugOrId!,
              'editChannelPage',
              validateChannelQueryParams(searchParamsFromUrl(request.url)),
            ),
          ),
      },

      // Tracks
      {
        path: 'tracks',
        lazy: () =>
          import('@app/admin/tracks-datatable-page/tracks-datatable-page'),
        shouldRevalidate: shouldRevalidateDatatableLoader,
        loader: async ({request}) =>
          queryClient.ensureQueryData(
            appQueries.tracks.index(searchParamsFromUrl(request.url)),
          ),
      },
      {
        path: 'tracks/new',
        lazy: () =>
          import('@app/admin/tracks-datatable-page/crupdate/create-track-page'),
      },
      {
        path: 'tracks/:trackId/edit',
        lazy: () =>
          import('@app/admin/tracks-datatable-page/crupdate/update-track-page'),
        loader: async ({params}) =>
          queryClient.ensureQueryData(
            appQueries.tracks.get(params.trackId!, 'editTrackPage'),
          ),
      },
      {
        path: 'tracks/:trackId/insights',
        lazy: () =>
          import('@app/web-player/backstage/insights/backstage-track-insights').then(
            ({NestedBackstageTrackInsights}) => ({
              Component: NestedBackstageTrackInsights,
            }),
          ),
        loader: async ({params}) =>
          queryClient.ensureQueryData(
            appQueries.tracks.get(params.trackId!, 'track'),
          ),
      },
      // Albums
      {
        path: 'albums',
        lazy: () =>
          import('@app/admin/albums-datatable-page/albums-datatable-page'),
        loader: ({request}) =>
          queryClient.ensureQueryData(
            appQueries.albums.index(searchParamsFromUrl(request.url)),
          ),
      },
      {
        path: 'albums/new',
        lazy: () =>
          import('@app/admin/albums-datatable-page/create-album-page'),
      },
      {
        path: 'albums/:albumId/edit',
        lazy: () =>
          import('@app/admin/albums-datatable-page/update-album-page'),
        loader: async ({params}) =>
          queryClient.ensureQueryData(
            appQueries.albums.get(params.albumId!, 'editAlbumPage'),
          ),
      },
      {
        path: 'albums/:albumId/insights',
        lazy: () =>
          import('@app/web-player/backstage/insights/backstage-album-insights').then(
            ({NestedBackstageAlbumInsights}) => ({
              Component: NestedBackstageAlbumInsights,
            }),
          ),
        loader: async ({params}) =>
          queryClient.ensureQueryData(
            appQueries.albums.get(params.albumId!, 'album'),
          ),
      },
      // Artists
      {
        path: 'artists',
        lazy: () =>
          import('@app/admin/artist-datatable-page/artist-datatable-page'),
        shouldRevalidate: shouldRevalidateDatatableLoader,
        loader: async ({request}) =>
          queryClient.ensureQueryData(
            appQueries.artists.index(searchParamsFromUrl(request.url)),
          ),
      },
      {
        path: 'artists/new',
        lazy: () =>
          import('@app/admin/artist-datatable-page/create-artist-page'),
      },
      {
        path: 'artists/:artistId/edit',
        lazy: () =>
          import('@app/admin/artist-datatable-page/update-artist-page'),
        loader: async ({params}) =>
          queryClient.ensureQueryData(
            appQueries.artists.show(params.artistId!).artist('editArtistPage'),
          ),
      },
      {
        path: 'artists/:artistId/insights',
        lazy: () =>
          import('@app/web-player/backstage/insights/backstage-artist-insights').then(
            ({NestedBackstageArtistInsights}) => ({
              Component: NestedBackstageArtistInsights,
            }),
          ),
        loader: async ({params}) =>
          queryClient.ensureQueryData(
            appQueries.artists.show(params.artistId!).artist('artist'),
          ),
      },
      // Upload
      {
        path: 'upload',
        lazy: () => import('@app/web-player/backstage/upload-page/upload-page'),
      },
      // Backstage requests
      {
        path: 'backstage-requests',
        lazy: () =>
          import('@app/admin/backstage-requests-datatable-page/backstage-requests-datatable-page'),
        shouldRevalidate: shouldRevalidateDatatableLoader,
        loader: ({request}) =>
          queryClient.ensureQueryData(
            appQueries.backstageRequests.index(
              searchParamsFromUrl(request.url),
            ),
          ),
      },
      {
        path: 'backstage-requests/:requestId',
        lazy: () =>
          import('@app/admin/backstage-requests-datatable-page/viewer/view-backstage-request-page'),
      },
      // Genres
      {
        path: 'genres',
        lazy: () =>
          import('@app/admin/genres-datatable-page/genres-datatable-page'),
        shouldRevalidate: shouldRevalidateDatatableLoader,
        loader: async ({request}) =>
          queryClient.ensureQueryData(
            appQueries.genres.index({
              ...searchParamsFromUrl(request.url),
              withCount: 'artists',
            }),
          ),
      },
      // Playlists
      {
        path: 'playlists',
        lazy: () =>
          import('@app/admin/playlist-datatable-page/playlist-datatable-page'),
        shouldRevalidate: shouldRevalidateDatatableLoader,
        loader: async ({request}) =>
          queryClient.ensureQueryData(
            appQueries.playlists.index(searchParamsFromUrl(request.url)),
          ),
      },

      // Lyrics
      {
        path: 'lyrics',
        lazy: () =>
          import('@app/admin/lyrics-datatable-page/lyrics-datatable-page'),
        shouldRevalidate: shouldRevalidateDatatableLoader,
        loader: async ({request}) =>
          queryClient.ensureQueryData(
            appQueries.lyrics.index(searchParamsFromUrl(request.url)),
          ),
      },

      // Comments
      {
        path: 'comments',
        lazy: () =>
          import('@common/comments/comments-datatable-page/comments-datatable-page'),
        shouldRevalidate: shouldRevalidateDatatableLoader,
        loader: async ({request}) =>
          queryClient.ensureQueryData(
            commentQueries.index(searchParamsFromUrl(request.url)),
          ),
      },
    ],
  },
];
