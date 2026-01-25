import {DownloadedMediaItemsTab} from '@app/web-player/library/downloads/downloaded-media-items-tab';
import {message} from '@ui/i18n/message';

const sortItems = {
  'lastSyncedAt:desc': message('Recently added'),
  'name:asc': message('A-Z'),
};

export function Component() {
  return <DownloadedMediaItemsTab sortItems={sortItems} type="playlist" />;
}
