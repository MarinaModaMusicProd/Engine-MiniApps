import {LucideIcon} from '@ui/icons/lucide/lucide-icon-wrapper';
import {SvgIconProps} from '@ui/icons/svg-icon';
import {
  BadgeCheckIcon,
  Disc3Icon,
  DownloadIcon,
  HistoryIcon,
  HouseIcon,
  LibraryBigIcon,
  ListMusicIcon,
  MicVocalIcon,
  MusicIcon,
  SearchIcon,
  TagsIcon,
  TrendingUpIcon,
} from 'lucide-react';
import {ReactElement} from 'react';

export const webPlayerSidebarIcons: Record<
  string,
  ReactElement<SvgIconProps>
> = {
  '/': <LucideIcon icon={HouseIcon} />,
  '/discover': <LucideIcon icon={HouseIcon} />,
  '/search': <LucideIcon icon={SearchIcon} />,
  '/library': <LucideIcon icon={LibraryBigIcon} />,
  '/popular-albums': <LucideIcon icon={Disc3Icon} />,
  '/genres': <LucideIcon icon={TagsIcon} />,
  '/popular-tracks': <LucideIcon icon={TrendingUpIcon} />,
  '/new-releases': <LucideIcon icon={BadgeCheckIcon} />,
  '/library/songs': <LucideIcon icon={MusicIcon} />,
  '/library/albums': <LucideIcon icon={Disc3Icon} />,
  '/library/artists': <LucideIcon icon={MicVocalIcon} />,
  '/library/playlists': <LucideIcon icon={ListMusicIcon} />,
  '/library/history': <LucideIcon icon={HistoryIcon} />,
  '/library/downloads': <LucideIcon icon={DownloadIcon} />,
};
