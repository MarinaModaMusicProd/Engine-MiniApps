import {PartialAlbum} from '@app/web-player/albums/album';
import {PartialArtist} from '@app/web-player/artists/artist';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {Track} from '@app/web-player/tracks/track';

export type PlayableModel =
  | Track
  | PartialAlbum
  | PartialArtist
  | PartialPlaylist;
