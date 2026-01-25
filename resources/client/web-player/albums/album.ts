import {Track} from '@app/web-player/tracks/track';
import {PartialArtist} from '../artists/artist';

export const ALBUM_MODEL = 'album';

export type FullAlbum = PartialAlbum & {
  spotify_id?: string | null;
  description: string | null;
  tracks?: Track[];
  tags?: {id: number; name: string; display_name: string | null}[];
  genres?: {id: number; name: string; display_name: string | null}[];
  tracks_count: number | null;
  reposts_count?: number;
  likes_count?: number;
  comments_count?: number;
  updated_at: string | null;
};

export type PartialAlbum = {
  id: number;
  name: string;
  image: string | null;
  artists: PartialArtist[];
  model_type: typeof ALBUM_MODEL;
  release_date: string | null;
  plays: number;
  views: number;
  owner_id: number | null;
  created_at: string | null;
};
