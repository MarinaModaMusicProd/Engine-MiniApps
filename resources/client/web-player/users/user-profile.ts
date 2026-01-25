import {ProfileDetails} from '@app/web-player/users/user-profile/profile-details';
import {NormalizedModel} from '@ui/types/normalized-model';

export type PartialUserProfile = {
  id: number;
  name: string;
  image: string | null;
  followers_count: number | null;
  is_pro: boolean;
  model_type: 'user';
};

export type FullUserProfile = PartialUserProfile & {
  username: string | null;
  profile: ProfileDetails;
  links: ProfileLink[];
  followed_users_count: number | null;
};

export type UserArtist = NormalizedModel & {
  role: string;
};

export type ProfileLink = {
  url: string;
  title: string;
};
