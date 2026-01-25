import {FullAlbum} from '@app/web-player/albums/album';
import {BackendResponse} from '@common/http/backend-response/backend-response';

export interface GetAlbumResponse extends BackendResponse {
  album: FullAlbum & {
    description: string | null;
  };
  loader: 'albumPage' | 'editAlbumPage' | 'album';
}
