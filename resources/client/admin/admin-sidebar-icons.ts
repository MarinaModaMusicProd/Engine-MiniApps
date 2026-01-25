import {ChartNoAxesCombinedIcon} from '@ui/icons/lucide/chart-no-axes-combined';
import {FileClockIcon} from '@ui/icons/lucide/file-clock';
import {AlbumIcon} from '@ui/icons/material/Album';
import {AssignmentTurnedInIcon} from '@ui/icons/material/AssignmentTurnedIn';
import {AudiotrackIcon} from '@ui/icons/material/Audiotrack';
import {ChromeReaderModeIcon} from '@ui/icons/material/ChromeReaderMode';
import {CommentIcon} from '@ui/icons/material/Comment';
import {FileCopyIcon} from '@ui/icons/material/FileCopy';
import {FileUploadIcon} from '@ui/icons/material/FileUpload';
import {LocalOfferIcon} from '@ui/icons/material/LocalOffer';
import {ManageAccountsIcon} from '@ui/icons/material/ManageAccounts';
import {MicNoneIcon} from '@ui/icons/material/MicNone';
import {PaidIcon} from '@ui/icons/material/Paid';
import {PeopleIcon} from '@ui/icons/material/People';
import {PlaylistPlayIcon} from '@ui/icons/material/PlaylistPlay';
import {ReceiptIcon} from '@ui/icons/material/Receipt';
import {SellIcon} from '@ui/icons/material/Sell';
import {SettingsIcon} from '@ui/icons/material/Settings';
import {TextFieldsIcon} from '@ui/icons/material/TextFields';
import {TranslateIcon} from '@ui/icons/material/Translate';
import {ViewQuiltIcon} from '@ui/icons/material/ViewQuilt';

export const adminSidebarIcons = {
  '/admin/reports': ChartNoAxesCombinedIcon,
  '/admin/settings': SettingsIcon,
  '/admin/settings/general': SettingsIcon,
  '/admin/subscriptions': PaidIcon,
  '/admin/plans': ReceiptIcon,
  '/admin/roles': ManageAccountsIcon,
  '/admin/custom-pages': ChromeReaderModeIcon,
  '/admin/tags': LocalOfferIcon,
  '/admin/files': FileCopyIcon,
  '/admin/localizations': TranslateIcon,
  '/admin/logs': FileClockIcon,
  '/admin/users': PeopleIcon,
  '/admin/artists': MicNoneIcon,
  '/admin/albums': AlbumIcon,
  '/admin/tracks': AudiotrackIcon,
  '/admin/genres': SellIcon,
  '/admin/lyrics': TextFieldsIcon,
  '/admin/playlists': PlaylistPlayIcon,
  '/admin/backstage-requests': AssignmentTurnedInIcon,
  '/admin/comments': CommentIcon,
  '/admin/channels': ViewQuiltIcon,
  '/admin/upload': FileUploadIcon,
};
