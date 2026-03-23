import {FullAlbum} from '../albums/album';
import {Track} from '../tracks/track';

export interface Repost {
  id: number;
  repostable?: Track | FullAlbum;
}
