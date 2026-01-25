import {PartialAlbum} from '@app/web-player/albums/album';
import {PartialArtist} from '@app/web-player/artists/artist';
import {Genre} from '@app/web-player/genres/genre';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {Track} from '@app/web-player/tracks/track';
import {PartialUserProfile} from '@app/web-player/users/user-profile';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {SimplePaginationResponse} from '@common/http/backend-response/pagination-response';
import {Tag} from '@common/tags/tag';

export interface SearchResponse extends BackendResponse {
  query: string;
  loader: 'search' | 'searchPage';
  results: {
    artists?: SimplePaginationResponse<PartialArtist>;
    albums?: SimplePaginationResponse<PartialAlbum>;
    tracks?: SimplePaginationResponse<Track>;
    playlists?: SimplePaginationResponse<PartialPlaylist>;
    users?: SimplePaginationResponse<PartialUserProfile>;
    genres?: SimplePaginationResponse<Genre>;
    tags?: SimplePaginationResponse<Tag>;
  };
}
