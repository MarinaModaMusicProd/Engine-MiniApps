import {FullAlbum} from '@app/web-player/albums/album';
import {FullArtist} from '@app/web-player/artists/artist';
import {Track} from '@app/web-player/tracks/track';
import {PartialUserProfile} from '@app/web-player/users/user-profile';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {PaginationResponse} from '@common/http/backend-response/pagination-response';

export interface GetArtistResponse extends BackendResponse {
  artist: FullArtist;
  albums?: PaginationResponse<FullAlbum>;
  grouped_albums?: Record<
    'album' | 'single' | 'ep' | 'compilation',
    {data: Omit<FullAlbum, 'tracks'>[]; hasMore: boolean}
  >;
  tracks?: PaginationResponse<Track>;
  top_tracks?: Track[];
  followers?: PaginationResponse<PartialUserProfile>;
  loader?: 'artistPage' | 'editArtistPage' | 'artist';
}

export const artistAlbumsResponseType = {
  WITH_TRACKS: 'withTracks',
  GROUPED_BY_TYPE: 'groupedByType',
  GRID: 'grid',
} as const;
