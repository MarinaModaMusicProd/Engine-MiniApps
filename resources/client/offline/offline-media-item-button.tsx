import {
  offlinedEntitiesStore,
  useOfflineEntitiesStore,
} from '@app/offline/offline-entities-store';
import {offlinedMediaItems} from '@app/offline/offline-media-items';
import {offlineQueue} from '@app/offline/offline-queue';
import {offlinedTracks} from '@app/offline/offlined-tracks';
import {useCanOffline} from '@app/offline/use-can-offline';
import {FullAlbum} from '@app/web-player/albums/album';
import {FullPlaylist} from '@app/web-player/playlists/playlist';
import {IconButton} from '@ui/buttons/icon-button';
import {Trans} from '@ui/i18n/trans';
import {CheckCircleFilledIcon} from '@ui/icons/check-circle-filled';
import {DownloadIcon} from '@ui/icons/material/Download';
import {Tooltip} from '@ui/tooltip/tooltip';
import clsx from 'clsx';
import {CSSProperties, useEffect, useState} from 'react';

type Props = {
  item: FullAlbum | FullPlaylist;
  className?: string;
  totalTracksCount: number;
};
export function OfflineMediaItemButton({
  item,
  className,
  totalTracksCount,
}: Props) {
  const [progress, setProgress] = useState<number>(0);
  const canOffline = useCanOffline();
  const isOfflined = useOfflineEntitiesStore(s =>
    item.model_type === 'album'
      ? s.offlinedAlbumIds.has(item.id)
      : s.offlinedPlaylistIds.has(item.id),
  );

  useEffect(() => {
    if (isOfflined) {
      let prevProgress = 0;
      const handler = () => {
        calculateProgress(item, totalTracksCount).then(newProgress => {
          if (newProgress !== prevProgress) {
            setProgress(newProgress);
          }
          prevProgress = newProgress;
        });
      };

      // get initial progress
      handler();

      return offlineQueue.listen('onActiveDownloadsChanged', handler);
    }
  }, [isOfflined, totalTracksCount]);

  if (!canOffline) return null;

  return (
    <OfflineEntityButtonLayout
      isOfflined={isOfflined}
      className={className}
      progress={progress}
      onClick={() => {
        if (isOfflined) {
          offlinedEntitiesStore().deleteOfflinedMediaItem(item);
        } else {
          offlinedEntitiesStore().offlineMediaItem(item);
        }
      }}
    />
  );
}

type OfflineEntityButtonLayoutProps = {
  isOfflined: boolean;
  className?: string;
  progress: number;
  onClick: () => void;
};
export function OfflineEntityButtonLayout({
  isOfflined,
  className,
  progress,
  onClick,
}: OfflineEntityButtonLayoutProps) {
  return (
    <Tooltip
      label={
        isOfflined ? (
          <Trans message="Remove from this device" />
        ) : (
          <Trans message="Make available offline" />
        )
      }
    >
      <IconButton
        variant="outline"
        className={clsx(
          className,
          isOfflined &&
            progress > 0 &&
            progress < 100 &&
            'button-with-progress',
        )}
        style={{'--progress': `${progress}%`} as CSSProperties}
        onClick={() => onClick()}
      >
        {isOfflined ? <CheckCircleFilledIcon /> : <DownloadIcon />}
      </IconButton>
    </Tooltip>
  );
}

async function calculateProgress(
  item: FullAlbum | FullPlaylist,
  totalTracksCount: number,
): Promise<number> {
  const totalProgress =
    Math.min(totalTracksCount, offlinedMediaItems.MAX_ITEMS) * 100;
  let currentProgress = 0;

  const tracksOfflinedByItem = await offlinedTracks.getTracksOfflinedBy(item);
  const offlinedTrackIds = tracksOfflinedByItem.map(t => t.id);
  const downloadedTracks = tracksOfflinedByItem
    .filter(t => t.isDownloaded)
    .map(t => t.id);

  currentProgress += downloadedTracks.length * 100;

  const activeDownloadsProgress = offlineQueue
    .getDownloadProgress()
    .entries()
    .reduce((acc, [id, progress]) => {
      if (offlinedTrackIds.includes(id)) {
        return acc + progress;
      }
      return acc;
    }, 0);

  currentProgress += activeDownloadsProgress;

  return Math.trunc((currentProgress / totalProgress) * 100);
}
