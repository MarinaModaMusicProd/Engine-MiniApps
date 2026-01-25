import {appQueries} from '@app/app-queries';
import {PlayerPageErrorMessage} from '@app/web-player/layout/player-page-error-message';
import {getSettingsPreviewMode} from '@common/admin/settings/preview/use-settings-preview-mode';
import {authGuard} from '@common/auth/guards/auth-route';
import {auth} from '@common/auth/use-auth';
import {queryClient} from '@common/http/query-client';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {redirect, RouteObject} from 'react-router';

export const webPlayerRoutes: RouteObject[] = [
  {
    path: 'track/:trackId/:trackName/embed',
    loader: ({params}) => {
      if (!authGuard({permission: 'music.view', requireLogin: false})) {
        return queryClient.ensureQueryData(
          appQueries.tracks.get(params.trackId!, 'trackPage'),
        );
      }
    },
    lazy: () => import('@app/web-player/tracks/track-embed'),
  },
  {
    path: 'album/:albumId/:artistName/:albumName/embed',
    loader: ({params}) => {
      if (!authGuard({permission: 'music.view', requireLogin: false})) {
        return queryClient.ensureQueryData(
          appQueries.albums.get(params.albumId!, 'albumPage'),
        );
      }
    },
    lazy: () => import('@app/web-player/albums/album-embed'),
  },
  {
    path: 'landing',
    lazy: () => import('@app/landing-page/landing-page'),
  },
  {
    path: '/',
    id: 'webPlayerRoot',
    loader: async () => {
      const isLoggedIn = auth.isLoggedIn;
      const homepageType = getBootstrapData().settings.homepage.type;

      if (
        !isLoggedIn &&
        homepageType === 'loginPage' &&
        !getSettingsPreviewMode().isInsideSettingsPreview
      ) {
        return redirect('/login');
      }

      if (homepageType === 'landingPage' && !isLoggedIn) {
        return await queryClient.ensureQueryData(
          appQueries.landingPageData.get(),
        );
      }
    },
    lazy: () => import('@app/homepage'),

    children: [
      {
        id: 'playerErrorElementWrapper',
        errorElement: <PlayerPageErrorMessage />,
        children: [
          {
            index: true,
            id: 'webPlayerIndex',
            lazy: () =>
              import('@app/web-player/channels/homepage-channel-page'),
          },
          {
            path: 'lyrics',
            lazy: () => import('@app/web-player/tracks/lyrics/lyrics-page'),
          },

          // artists
          {
            path: 'artist/:artistId/:artistName',
            lazy: () =>
              import('@app/web-player/artists/artist-page/artist-page'),
            loader: async ({params}) => {
              queryClient.ensureQueryData(
                appQueries.artists.show(params.artistId!).artist('artistPage'),
              );
            },
          },
          {
            path: 'artist/:artistId',
            lazy: () =>
              import('@app/web-player/artists/artist-page/artist-page'),
            loader: async ({params}) => {
              queryClient.ensureQueryData(
                appQueries.artists.show(params.artistId!).artist('artistPage'),
              );
            },
          },

          // playlists
          {
            path: 'playlist/:playlistId/:playlistName',
            lazy: () =>
              import('@app/web-player/playlists/playlist-page/playlist-page'),
            loader: async ({params}) => {
              queryClient.ensureQueryData(
                appQueries.playlists
                  .show(params.playlistId!)
                  .playlist('playlistPage'),
              );
            },
          },
          // albums
          {
            path: 'album/:albumId/:artistName/:albumName',
            lazy: () => import('@app/web-player/albums/album-page'),
            loader: async ({params}) => {
              queryClient.ensureQueryData(
                appQueries.albums.get(params.albumId!, 'albumPage'),
              );
            },
          },
          // tracks
          {
            path: 'track/:trackId/:trackName',
            lazy: () => import('@app/web-player/tracks/track-page'),
            loader: async ({params}) => {
              queryClient.ensureQueryData(
                appQueries.tracks.get(params.trackId!, 'trackPage'),
              );
            },
          },

          // tags
          {
            path: 'tag/:tagName',
            lazy: () => import('@app/web-player/tags/tag-page'),
            children: [
              {
                index: true,
                loader: () => redirect('tracks'),
              },
              {
                path: 'tracks',
                lazy: () => import('@app/web-player/tags/tag-tracks-tab'),
              },
              {
                path: 'albums',
                lazy: () => import('@app/web-player/tags/tag-albums-tab'),
              },
            ],
          },

          // User profile
          {
            path: 'user/:userId/:userName',
            lazy: () =>
              import('@app/web-player/users/user-profile/user-profile-page'),
            loader: async ({params}) => {
              queryClient.ensureQueryData(
                appQueries.userProfile(params.userId!).details,
              );
            },
            children: [
              {
                index: true,
                loader: () => redirect('tracks'),
              },
              {
                path: 'tracks',
                lazy: () =>
                  import('@app/web-player/users/user-profile/panels/profile-tracks-panel'),
                loader: ({params}) => {
                  queryClient.ensureInfiniteQueryData(
                    appQueries.tracks.liked(params.userId!),
                  );
                },
              },
              {
                path: 'playlists',
                lazy: () =>
                  import('@app/web-player/users/user-profile/panels/profile-playlists-panel'),
                loader: ({params}) => {
                  queryClient.ensureInfiniteQueryData(
                    appQueries.playlists.userPlaylists(params.userId!),
                  );
                },
              },
              {
                path: 'reposts',
                lazy: () =>
                  import('@app/web-player/users/user-profile/panels/profile-reposts-panel'),
                loader: ({params}) => {
                  queryClient.ensureInfiniteQueryData(
                    appQueries.reposts.index(params.userId!),
                  );
                },
              },
              {
                path: 'artists',
                lazy: () =>
                  import('@app/web-player/users/user-profile/panels/profile-artists-panel'),
                loader: ({params}) => {
                  queryClient.ensureInfiniteQueryData(
                    appQueries.artists.liked(params.userId!),
                  );
                },
              },
              {
                path: 'followers',
                lazy: () =>
                  import('@app/web-player/users/user-profile/panels/profile-followers-panel'),
                loader: ({params}) => {
                  queryClient.ensureInfiniteQueryData(
                    appQueries.userProfile(params.userId!).followers,
                  );
                },
              },
              {
                path: 'following',
                lazy: () =>
                  import('@app/web-player/users/user-profile/panels/profile-followed-users-panel'),
                loader: ({params}) => {
                  queryClient.ensureInfiniteQueryData(
                    appQueries.userProfile(params.userId!).followedUsers,
                  );
                },
              },
              {
                path: 'albums',
                lazy: () =>
                  import('@app/web-player/users/user-profile/panels/profile-albums-panel'),
                loader: ({params}) => {
                  queryClient.ensureInfiniteQueryData(
                    appQueries.albums.liked(params.userId!, {with: 'tracks'}),
                  );
                },
              },
            ],
          },

          // Radio
          {
            path: 'radio/:seedType/:seedId/:seeName',
            lazy: () => import('@app/web-player/radio/radio-page'),
          },

          // Search
          {
            path: 'search',
            lazy: () => import('@app/web-player/search/search-results-page'),
          },
          {
            path: 'search/:searchQuery',
            lazy: () => import('@app/web-player/search/search-results-page'),
            children: [
              {
                index: true,
                lazy: () => import('@app/web-player/search/search-results-tab'),
              },
              {
                path: ':tabName',
                lazy: () => import('@app/web-player/search/search-results-tab'),
              },
            ],
          },

          // library
          {
            loader: () => authGuard(),
            children: [
              {
                path: 'library',
                lazy: () => import('@app/web-player/library/library-page'),
              },
              {
                path: 'library/songs',
                lazy: () =>
                  import('@app/web-player/library/library-tracks-page'),
              },
              {
                path: 'library/playlists',
                lazy: () =>
                  import('@app/web-player/library/library-playlists-page'),
              },
              {
                path: 'library/albums',
                lazy: () =>
                  import('@app/web-player/library/library-albums-page'),
              },
              {
                path: 'library/artists',
                lazy: () =>
                  import('@app/web-player/library/library-artists-page'),
              },
              {
                path: 'library/history',
                lazy: () =>
                  import('@app/web-player/library/library-history-page'),
              },
              {
                path: 'library/downloads',
                lazy: () =>
                  import('@app/web-player/library/downloads/library-downloads-page'),
                children: [
                  {
                    index: true,
                    loader: () => redirect('songs'),
                  },
                  {
                    path: 'songs',
                    lazy: () =>
                      import('@app/web-player/library/downloads/downloaded-tracks-tab'),
                  },
                  {
                    path: 'albums',
                    lazy: () =>
                      import('@app/web-player/library/downloads/downloaded-albums-tab'),
                  },
                  {
                    path: 'playlists',
                    lazy: () =>
                      import('@app/web-player/library/downloads/downloaded-playlists-tab'),
                  },
                ],
              },
            ],
          },

          // Channels
          {
            path: ':slugOrId',
            lazy: () => import('@app/web-player/channels/channel-page'),
          },
          {
            path: 'channel/:slugOrId',
            lazy: () => import('@app/web-player/channels/channel-page'),
          },
          {
            path: ':slugOrId/:restriction',
            lazy: () => import('@app/web-player/channels/channel-page'),
          },
          {
            path: 'channel/:slugOrId/:restriction',
            lazy: () => import('@app/web-player/channels/channel-page'),
          },
        ],
      },
    ],
  },
];
