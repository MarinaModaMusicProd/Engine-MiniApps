import {SettingsNavItem} from '@common/admin/settings/settings-nav-config';
import {message} from '@ui/i18n/message';
import {LucideIcon} from '@ui/icons/lucide/lucide-icon-wrapper';
import {
  ChartColumnBigIcon,
  CircleDollarSignIcon,
  ClipboardClockIcon,
  Disc3Icon,
  FileIcon,
  FormIcon,
  GlobeIcon,
  ListMusicIcon,
  MessageCircleIcon,
  MicVocalIcon,
  MusicIcon,
  NotebookTextIcon,
  SettingsIcon,
  SquareStackIcon,
  StickyNoteIcon,
  TagsIcon,
  TextAlignEndIcon,
  TvIcon,
  UploadIcon,
  UserRoundIcon,
  UserRoundKeyIcon,
} from 'lucide-react';

// icons
export const AdminSidebarIcons = {
  '/admin/reports': <LucideIcon icon={ChartColumnBigIcon} />,
  '/admin/settings': <LucideIcon icon={SettingsIcon} />,
  '/admin/plans': <LucideIcon icon={SquareStackIcon} />,
  '/admin/subscriptions': <LucideIcon icon={CircleDollarSignIcon} />,
  '/admin/users': <LucideIcon icon={UserRoundIcon} />,
  '/admin/roles': <LucideIcon icon={UserRoundKeyIcon} />,
  '/admin/upload': <LucideIcon icon={UploadIcon} />,
  '/admin/channels': <LucideIcon icon={TvIcon} />,
  '/admin/artists': <LucideIcon icon={MicVocalIcon} />,
  '/admin/albums': <LucideIcon icon={Disc3Icon} />,
  '/admin/tracks': <LucideIcon icon={MusicIcon} />,
  '/admin/genres': <LucideIcon icon={TagsIcon} />,
  '/admin/lyrics': <LucideIcon icon={TextAlignEndIcon} />,
  '/admin/playlists': <LucideIcon icon={ListMusicIcon} />,
  '/admin/backstage-requests': <LucideIcon icon={FormIcon} />,
  '/admin/comments': <LucideIcon icon={MessageCircleIcon} />,
  '/admin/custom-pages': <LucideIcon icon={NotebookTextIcon} />,
  '/admin/tags': <LucideIcon icon={StickyNoteIcon} />,
  '/admin/files': <LucideIcon icon={FileIcon} />,
  '/admin/localizations': <LucideIcon icon={GlobeIcon} />,
  '/admin/logs': <LucideIcon icon={ClipboardClockIcon} />,
};

// settings nav config
export const AppSettingsNavConfig: SettingsNavItem[] = [
  {
    label: message('Automation'),
    position: 2,
    to: 'providers',
  },
  {
    label: message('Player'),
    position: 2,
    to: 'player',
  },
  {label: message('Landing page'), to: 'landing-page', position: 2},
  {
    label: message('Local search'),
    position: 2,
    to: 'search',
  },
  {
    label: message('Ads'),
    position: 20,
    to: 'ads',
  },
];

// docs urls
const base = 'https://support.vebto.com/hc/articles';
export const AdminDocsUrls = {
  manualUpdate: `${base}/21/23/295/updating-to-new-versions#method-2-manual-update`,
  settings: {
    uploading: `${base}/21/79/297/configuring-file-upload`,
    s3: `${base}/21/25/216/storing-files-on-amazon-s3`,
    backblaze: `${base}/21/25/217/storing-files-on-backblaze`,
    authentication: `${base}/21/25/274/authentication-settings`,
    automation: `${base}/28/31/299/content-automation-and-importing`,
    search: `${base}/28/34/159/local-search-settings`,
    queue: `${base}/28/34/224/queues`,
    outgoingEmail: `${base}/28/34/76/outgoing-emails`,
    menus: `${base}/28/34/205/changing-menu-links`,
    logging: `${base}/28/82/149/error-logging`,
  } as any,
  pages: {
    channels: `${base}/28/31/300/channels`,
    roles: `${base}/28/34/302/permissions-and-roles`,
    translations: `${base}/28/34/117/translating-the-site`,
    backstage: `${base}/28/31/304/backstage-managing-artist-access-and-requests`,
    subscriptions: `${base}/28/84/303/subscriptions-explained`,
  } as any,
} as any;
