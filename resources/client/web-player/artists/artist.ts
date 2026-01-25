import {ProfileLink} from '../users/user-profile';
import {ProfileDetails} from '../users/user-profile/profile-details';

export const ARTIST_MODEL = 'artist';

export type FullArtist = PartialArtist & {
  spotify_id?: string;
  followers_count?: number;
  likes_count?: number;
  albums_count?: number;
  updated_at?: string;
  similar?: PartialArtist[];
  genres?: {id: number; name: string; display_name: string}[];
  views: number;
  plays: number;
  profile?: ProfileDetails;
  profile_images?: {url: string; id: number}[];
  links?: ProfileLink[];
  disabled?: boolean;
};

export type PartialArtist = {
  id: number;
  name: string;
  image_small: string | undefined;
  verified: boolean;
  model_type: 'artist';
};
