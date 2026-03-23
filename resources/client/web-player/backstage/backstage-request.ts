import {FileEntry} from '@common/uploads/file-entry';
import {User} from '@ui/types/user';
import {PartialArtist} from '../artists/artist';

interface ExternalSocialProfile {
  id: number | string;
  email: string;
  avatar: string;
  name: string;
  profileUrl: string;
}

export interface BackstageRequest {
  id: number;
  artist_name: string;
  artist_id: string;
  type: string;
  user_id: number;
  user: User;
  artist?: PartialArtist;
  created_at: string;
  status: 'approved' | 'pending' | 'denied';
  data: {
    socialProfiles: {[key: string]: ExternalSocialProfile};
    name?: string;
    image?: string;
    company?: string;
    role?: string;
    passport_scan_entry_id?: number;
    passport_scan_entry?: FileEntry;
  };
}
