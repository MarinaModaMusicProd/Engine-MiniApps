import {PartialAlbum} from '@app/web-player/albums/album';
import {PartialArtist} from '@app/web-player/artists/artist';
import {Lyric} from '@app/web-player/tracks/lyrics/lyric';

export const TRACK_MODEL = 'track';

export type Track = {
  id: number;
  name: string;
  image: string | null;
  duration: number | null;
  artists: PartialArtist[];
  plays: number | null;
  popularity: number | null;
  src: string | null;
  src_local: boolean;
  album?: PartialAlbum;
  owner_id: number | null;
  model_type: 'track';
  tags?: {id: number; name: string; display_name: string}[];
  genres?: {id: number; name: string; display_name: string}[];
  likes_count: number | null;
  reposts_count: number | null;
  comments_count: number | null;
  created_at: string | null;
  updated_at: string | null;
  lyric?: Lyric | null;
};

export type LibraryPageTrack = Track & {
  added_at: string | null;
};
