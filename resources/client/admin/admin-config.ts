import {SettingsNavItem} from '@common/admin/settings/settings-nav-config';
import {message} from '@ui/i18n/message';
import {ChartNoAxesCombinedIcon} from '@ui/icons/lucide/chart-no-axes-combined';
import {FileClockIcon} from '@ui/icons/lucide/file-clock';
import {AlbumIcon} from '@ui/icons/material/Album';
import {AssignmentTurnedInIcon} from '@ui/icons/material/AssignmentTurnedIn';
import {AudiotrackIcon} from '@ui/icons/material/Audiotrack';
import {ChromeReaderModeIcon} from '@ui/icons/material/ChromeReaderMode';
import {CommentIcon} from '@ui/icons/material/Comment';
import {FileCopyIcon} from '@ui/icons/material/FileCopy';
import {FileUploadIcon} from '@ui/icons/material/FileUpload';
import {LabelIcon} from '@ui/icons/material/Label';
import {ManageAccountsIcon} from '@ui/icons/material/ManageAccounts';
import {MicIcon} from '@ui/icons/material/Mic';
import {PaidIcon} from '@ui/icons/material/Paid';
import {PeopleIcon} from '@ui/icons/material/People';
import {PlaylistPlayIcon} from '@ui/icons/material/PlaylistPlay';
import {QueueMusicIcon} from '@ui/icons/material/QueueMusic';
import {ReceiptIcon} from '@ui/icons/material/Receipt';
import {SellIcon} from '@ui/icons/material/Sell';
import {SettingsIcon} from '@ui/icons/material/Settings';
import {TextFieldsIcon} from '@ui/icons/material/TextFields';
import {TranslateIcon} from '@ui/icons/material/Translate';

// icons
export const AdminSidebarIcons = {
  '/admin/reports': ChartNoAxesCombinedIcon,
  '/admin/settings': SettingsIcon,
  '/admin/plans': ReceiptIcon,
  '/admin/subscriptions': PaidIcon,
  '/admin/users': PeopleIcon,
  '/admin/roles': ManageAccountsIcon,
  '/admin/upload': FileUploadIcon,
  '/admin/channels': QueueMusicIcon,
  '/admin/artists': MicIcon,
  '/admin/albums': AlbumIcon,
  '/admin/tracks': AudiotrackIcon,
  '/admin/genres': LabelIcon,
  '/admin/lyrics': TextFieldsIcon,
  '/admin/playlists': PlaylistPlayIcon,
  '/admin/backstage-requests': AssignmentTurnedInIcon,
  '/admin/comments': CommentIcon,
  '/admin/custom-pages': ChromeReaderModeIcon,
  '/admin/tags': SellIcon,
  '/admin/files': FileCopyIcon,
  '/admin/localizations': TranslateIcon,
  '/admin/logs': FileClockIcon,
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
