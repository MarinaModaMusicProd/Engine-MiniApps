import {FullAlbum} from '@app/web-player/albums/album';
import {assignAlbumToTracks} from '@app/web-player/albums/assign-album-to-tracks';
import {GetAlbumResponse} from '@app/web-player/albums/requests/get-album-response';
import {FullArtist} from '@app/web-player/artists/artist';
import {AlbumsViewMode} from '@app/web-player/artists/artist-page/discography-panel/albums-view-mode';
import {GetArtistResponse} from '@app/web-player/artists/requests/get-artist-response';
import {BackstageRequest} from '@app/web-player/backstage/backstage-request';
import {Genre} from '@app/web-player/genres/genre';
import {LibrarySearchParams} from '@app/web-player/library/library-search-params';
import {
  FullPlaylist,
  PartialPlaylist,
} from '@app/web-player/playlists/playlist';
import {GetPlaylistResponse} from '@app/web-player/playlists/requests/get-playlist-response';
import {RadioRecommendationsResponse} from '@app/web-player/radio/radio-recommendations-response';
import {Repost} from '@app/web-player/reposts/repost';
import {SearchResponse} from '@app/web-player/search/search-response';
import {Lyric} from '@app/web-player/tracks/lyrics/lyric';
import {GetTrackResponse} from '@app/web-player/tracks/requests/get-track-response';
import {Track} from '@app/web-player/tracks/track';
import {
  FullUserProfile,
  PartialUserProfile,
} from '@app/web-player/users/user-profile';
import {auth} from '@common/auth/use-auth';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {
  PaginationResponse,
  SimplePaginationResponse,
} from '@common/http/backend-response/pagination-response';
import {queryFactoryHelpers} from '@common/http/queries-file-helpers';
import {apiClient} from '@common/http/query-client';
import {queryOptions} from '@tanstack/react-query';
import {BootstrapData} from '@ui/bootstrap-data/bootstrap-data';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';

const get = queryFactoryHelpers.get;
const paginate = queryFactoryHelpers.paginate;
const infiniteQuery = queryFactoryHelpers.infiniteQuery;

export const appQueries = {
  artists: {
    invalidateKey: ['artists'],
    index: (s: Record<string, string>) => paginate<FullArtist>('artists', s),
    show: (artistId: number | string) => ({
      invalidateKey: ['artists', `${artistId}`],
      artist: (
        loader: 'artistPage' | 'editArtistPage' | 'artist' = 'artist',
      ) => {
        const params = {loader};
        return queryOptions({
          queryKey: ['artists', `${artistId}`, params],
          queryFn: () =>
            apiClient
              .get<GetArtistResponse>(`artists/${artistId}`, {params})
              .then(r => {
                if (r.data.albums) {
                  r.data.albums.data = r.data.albums.data.map(a =>
                    assignAlbumToTracks(a),
                  );
                }
                return r.data;
              }),
          initialData: () => {
            const data = getBootstrapData().loaders?.[params.loader];
            if (
              data?.artist?.id == artistId &&
              data?.loader === params.loader
            ) {
              return data;
            }
            return undefined;
          },
        });
      },
      tracks: (initialData?: PaginationResponse<Track>) => {
        return infiniteQuery<Track>({
          queryKey: ['artists', `${artistId}`, 'tracks'],
          endpoint: `artists/${artistId}/tracks`,
          initialData,
        });
      },
      albums: (
        viewMode: AlbumsViewMode,
        initialData?: PaginationResponse<FullAlbum> | null,
      ) => {
        return infiniteQuery<FullAlbum>({
          queryKey: ['artists', `${artistId}`, 'albums', viewMode],
          endpoint: `artists/${artistId}/albums`,
          initialData,
          queryParams: {
            viewMode,
          },
          transformResponse: response => {
            response.pagination.data = response.pagination.data.map(album =>
              assignAlbumToTracks(album),
            );
            return response;
          },
        });
      },
      followers: (initialData?: PaginationResponse<PartialUserProfile>) => {
        return infiniteQuery<PartialUserProfile>({
          queryKey: ['artists', `${artistId}`, 'followers'],
          endpoint: `artists/${artistId}/followers`,
          initialData,
        });
      },
    }),
    get: (
      id: string | number,
      loader: 'artistPage' | 'editArtistPage' | 'artist' = 'artist',
    ) => {
      const params = {loader};
      return queryOptions({
        queryKey: ['artists', id, params],
        queryFn: () =>
          apiClient
            .get<GetArtistResponse>(`artists/${id}`, {params})
            .then(r => {
              if (r.data.albums) {
                r.data.albums.data = r.data.albums.data.map(a =>
                  assignAlbumToTracks(a),
                );
              }
              return r.data;
            }),
        initialData: () => {
          const data = getBootstrapData().loaders?.[params.loader];
          if (data?.artist?.id == id && data?.loader === params.loader) {
            return data;
          }
          return undefined;
        },
      });
    },
    liked: (userId: number | string, queryParams?: LibrarySearchParams) => {
      userId = userId == auth.user?.id ? 'me' : userId;
      return infiniteQuery<FullArtist>({
        queryKey: ['artists', 'liked', `${userId}`, queryParams],
        endpoint: `users/${userId}/liked-artists`,
        queryParams,
      });
    },
  },
  albums: {
    invalidateKey: ['albums'],
    index: (s: Record<string, string>) => paginate<FullAlbum>('albums', s),
    get: (
      id: string | number,
      loader: GetAlbumResponse['loader'] = 'album',
    ) => {
      const params = {loader};
      return queryOptions<GetAlbumResponse>({
        queryKey: ['albums', id, params],
        queryFn: async () =>
          apiClient.get(`albums/${id}`, {params}).then(r => {
            r.data.album = assignAlbumToTracks(r.data.album);
            return r.data;
          }),
        initialData: () => {
          const data = getBootstrapData().loaders?.[params.loader];
          if (data?.album?.id == id && data?.loader === params.loader) {
            return data;
          }
          return undefined;
        },
      });
    },
    liked: (userId: number | string, queryParams?: LibrarySearchParams) => {
      userId = userId == auth.user?.id ? 'me' : userId;
      return infiniteQuery<FullAlbum>({
        queryKey: ['albums', 'liked', `${userId}`, queryParams],
        endpoint: `users/${userId}/liked-albums`,
        queryParams,
      });
    },
    byTag: (tagName: string) => {
      return infiniteQuery<FullAlbum>({
        queryKey: ['albums', 'byTag', tagName],
        endpoint: `tags/${tagName}/albums`,
      });
    },
  },
  tracks: {
    invalidateKey: ['tracks'],
    index: (search: Record<string, string> = {}) =>
      paginate<Track>('tracks', search),
    get: (
      id: string | number,
      loader: GetTrackResponse['loader'] = 'track',
    ) => {
      const params = {loader};
      return queryOptions({
        queryKey: ['tracks', id, params],
        queryFn: () =>
          apiClient.get<GetTrackResponse>(`tracks/${id}`, {params}).then(r => {
            if (r.data.track.album) {
              r.data.track = {
                ...r.data.track,
                album: assignAlbumToTracks(r.data.track.album),
              };
            }
            return r.data;
          }),
        initialData: () => {
          const data = getBootstrapData().loaders?.[params.loader];
          if (data?.track?.id == id && data?.loader === params.loader) {
            return data;
          }
          return undefined;
        },
      });
    },
    liked: (userId: number | string, queryParams?: LibrarySearchParams) => {
      userId = userId == auth.user?.id ? 'me' : userId;
      return infiniteQuery<Track>({
        queryKey: ['tracks', 'liked', `${userId}`, queryParams],
        endpoint: `users/${userId}/liked-tracks`,
        queryParams,
      });
    },
    byTag: (tagName: string) => {
      return infiniteQuery<Track>({
        queryKey: ['tracks', 'byTag', tagName],
        endpoint: `tags/${tagName}/tracks`,
      });
    },
  },
  playlists: {
    invalidateKey: ['playlists'],
    index: (search: Record<string, string> = {}) =>
      paginate<FullPlaylist>('playlists', search),
    show: (id: number | string) => {
      const baseKey = ['playlists', `${id}`];
      return {
        invalidateKey: baseKey,
        playlist: (
          loader: GetPlaylistResponse['loader'],
          perPage: number = 30,
        ) =>
          queryOptions({
            queryKey: [...baseKey, loader, perPage],
            queryFn: async () =>
              apiClient
                .get<GetPlaylistResponse>(`playlists/${id}`, {
                  params: {perPage, loader},
                })
                .then(r => r.data),
            initialData: () => {
              const data = getBootstrapData().loaders?.[loader];
              if (
                data?.playlist?.id == id &&
                data?.loader === loader &&
                data?.tracks?.per_page == perPage
              ) {
                return data;
              }
              return undefined;
            },
          }),
        tracks: (
          queryParams?: Record<string, unknown>,
          initialData?: PaginationResponse<Track>,
        ) => {
          return infiniteQuery<Track>({
            queryKey: [...baseKey, 'tracks', queryParams],
            endpoint: `playlists/${id}/tracks`,
            queryParams,
            initialData,
          });
        },
      };
    },
    userPlaylists: (
      userId: number | string,
      queryParams?: LibrarySearchParams,
    ) => {
      userId = userId == auth.user?.id ? 'me' : userId;
      return infiniteQuery<PartialPlaylist>({
        queryKey: ['playlists', 'user', `${userId}`, queryParams],
        endpoint: `users/${userId}/playlists`,
        queryParams,
      });
    },
    compactAuthUserPlaylists: () => {
      return queryOptions<PartialPlaylist[]>({
        queryKey: ['playlists', 'user', 'me', 'compact'],
        staleTime: Infinity,
        enabled: auth.isLoggedIn,
        queryFn: () =>
          get('users/me/playlists', {
            perPage: 30,
            orderBy: 'updated_at',
            orderDir: 'desc',
          }).then(r => (r as any).pagination.data),
        initialData: () => getBootstrapData().playlists || [],
      });
    },
  },
  userProfile: (userId: string | number) => {
    userId = userId == auth.user?.id ? 'me' : userId;
    const baseKey = ['users', `${userId}`, 'profile'];
    return {
      invalidateKey: baseKey,
      details: queryOptions<{user: FullUserProfile} & BackendResponse>({
        queryKey: [...baseKey, 'details'],
        queryFn: () => get(`user-profile/${userId}`),
        initialData: () => {
          const data = getBootstrapData().loaders?.userProfilePage;
          if (data?.user?.id == userId) {
            return data;
          }
        },
      }),
      followers: infiniteQuery<PartialUserProfile>({
        queryKey: ['users', 'profile', 'followers', `${userId}`],
        endpoint: `users/${userId}/followers`,
      }),
      followedUsers: infiniteQuery<PartialUserProfile>({
        queryKey: [...baseKey, 'followed-users'],
        endpoint: `users/${userId}/followed-users`,
      }),
      playHistory: (queryParams?: LibrarySearchParams) => {
        return infiniteQuery<Track>({
          queryKey: [...baseKey, 'play-history', queryParams],
          endpoint: `tracks/plays/${userId}`,
          queryParams,
        });
      },
    };
  },
  search: {
    invalidateKey: ['search'],
    results: (loader: 'search' | 'searchPage', query: string) => {
      return queryOptions<SearchResponse>({
        queryKey: ['search', loader, query],
        queryFn: ({signal}) =>
          get(
            `search`,
            {
              query,
              loader,
            },
            signal,
          ),
        initialData: () => {
          const data = getBootstrapData().loaders?.[loader];
          if (data?.query == query && data?.loader === loader) {
            return data;
          }
          return undefined;
        },
      });
    },
    infiniteResults: <T>(
      modelType: string,
      query: string,
      initialData?: SimplePaginationResponse<T>,
    ) => {
      return infiniteQuery<T>({
        queryKey: ['search', 'infinite', modelType, query],
        endpoint: `search/model/${modelType}`,
        queryParams: {
          query,
          paginate: 'simple',
          perPage: initialData?.per_page || 20,
        },
        initialData,
      });
    },
  },
  reposts: {
    invalidateKey: ['reposts'],
    index: (userId: number | string) =>
      infiniteQuery<Repost>({
        queryKey: ['reposts', `${userId}`],
        endpoint: `users/${userId}/reposts`,
      }),
  },
  genres: {
    invalidateKey: ['genres'],
    index: (search: Record<string, string> = {}) =>
      paginate<Genre>('genres', search),
  },
  lyrics: {
    invalidateKey: ['lyrics'],
    index: (search: Record<string, string> = {}) =>
      paginate<Lyric>('lyrics', search),
  },
  radio: {
    invalidateKey: ['radio'],
    recommendations: (seedType: string, seedId: string | number) => {
      return queryOptions<RadioRecommendationsResponse>({
        queryKey: ['radio', seedType, seedId],
        queryFn: () => get(`radio/${seedType}/${seedId}`),
        staleTime: Infinity,
      });
    },
  },
  backstageRequests: {
    invalidateKey: ['backstage-request'],
    index: (search: Record<string, string> = {}) =>
      paginate<BackstageRequest>('backstage-request', search),
  },
  landingPageData: {
    get: () =>
      queryOptions<Required<Required<BootstrapData>['loaders']>['landingPage']>(
        {
          queryKey: ['landing-page-data'],
          queryFn: () => get('landing-page-data'),
          initialData: () => {
            const data = getBootstrapData().loaders?.landingPage;
            if (data) {
              return data;
            }
          },
        },
      ),
  },
};
