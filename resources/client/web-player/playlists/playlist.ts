import {Track} from '@app/web-player/tracks/track';

export const PLAYLIST_MODEL = 'playlist';

export type FullPlaylist = PartialPlaylist & {
  tracks_count?: number;
  tracks?: Track[];
  updated_at: string;
  views: number;
  description: string;
  owner?: {
    id: number;
    name: string;
    email: string;
    image: string | null;
  };
};

export type PartialPlaylist = {
  id: number;
  name: string;
  public: boolean;
  collaborative: boolean;
  image: string | null;
  owner_id: number | null;
  editors: {
    id: number;
    name: string;
    image: string | null;
  }[];
  model_type: typeof PLAYLIST_MODEL;
};
