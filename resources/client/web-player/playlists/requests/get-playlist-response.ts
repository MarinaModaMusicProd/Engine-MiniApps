import {FullPlaylist} from '@app/web-player/playlists/playlist';
import {Track} from '@app/web-player/tracks/track';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {PaginationResponse} from '@common/http/backend-response/pagination-response';

export interface GetPlaylistResponse extends BackendResponse {
  playlist: FullPlaylist;
  tracks: PaginationResponse<Track>;
  totalDuration: number;
  loader: 'playlistPage' | 'playlist';
}
