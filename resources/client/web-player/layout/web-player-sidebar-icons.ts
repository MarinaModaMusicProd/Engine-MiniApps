import {AlbumIcon} from '@ui/icons/material/Album';
import {AudiotrackIcon} from '@ui/icons/material/Audiotrack';
import {DownloadForOfflineIcon} from '@ui/icons/material/DownloadForOffline';
import {HistoryIcon} from '@ui/icons/material/History';
import {HomeIcon} from '@ui/icons/material/Home';
import {LibraryMusicIcon} from '@ui/icons/material/LibraryMusic';
import {MicNoneIcon} from '@ui/icons/material/MicNone';
import {PlaylistPlayIcon} from '@ui/icons/material/PlaylistPlay';
import {SearchIcon} from '@ui/icons/material/Search';
import {SellIcon} from '@ui/icons/material/Sell';
import {TrendingUpIcon} from '@ui/icons/material/TrendingUp';
import {VerifiedIcon} from '@ui/icons/material/Verified';

export const webPlayerSidebarIcons = {
  '/': HomeIcon,
  '/discover': HomeIcon,
  '/search': SearchIcon,
  '/library': LibraryMusicIcon,
  '/popular-albums': AlbumIcon,
  '/genres': SellIcon,
  '/popular-tracks': TrendingUpIcon,
  '/new-releases': VerifiedIcon,
  '/library/songs': AudiotrackIcon,
  '/library/albums': AlbumIcon,
  '/library/artists': MicNoneIcon,
  '/library/playlists': PlaylistPlayIcon,
  '/library/history': HistoryIcon,
  '/library/downloads': DownloadForOfflineIcon,
};
