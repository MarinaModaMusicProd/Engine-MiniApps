import {FullAlbum} from '@app/web-player/albums/album';
import {Track} from '@app/web-player/tracks/track';
import {BackendResponse} from '@common/http/backend-response/backend-response';

export interface GetTrackResponse extends BackendResponse {
  track: Omit<Track, 'album'> & {
    description: string | null;
    album: FullAlbum;
  };
  loader: 'track' | 'trackPage' | 'editTrackPage';
}
