import {PartialAlbum} from '@app/web-player/albums/album';
import {PartialArtist} from '@app/web-player/artists/artist';
import {Track} from '@app/web-player/tracks/track';

export type Likeable = PartialArtist | PartialAlbum | Track;
