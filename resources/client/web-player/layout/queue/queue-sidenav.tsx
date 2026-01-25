import {TrackOfflinedIndicator} from '@app/offline/entitiy-offline-indicator-icon';
import {useOfflineEntitiesStore} from '@app/offline/offline-entities-store';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {QueueTrackContextDialog} from '@app/web-player/layout/queue/queue-track-context-dialog';
import {useMiniPlayerIsHidden} from '@app/web-player/overlay/use-mini-player-is-hidden';
import {EqualizerImage} from '@app/web-player/tracks/equalizer-image/equalizer-image';
import {PlayArrowFilledIcon} from '@app/web-player/tracks/play-arrow-filled';
import {Track} from '@app/web-player/tracks/track';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {useIsOffline} from '@app/web-player/use-is-offline';
import {useIsMediaPlaying} from '@common/player/hooks/use-is-media-playing';
import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {MediaItem} from '@common/player/media-item';
import {DashboardLayoutContext} from '@common/ui/dashboard-layout/dashboard-layout-context';
import {IconButton} from '@ui/buttons/icon-button';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {CloseIcon} from '@ui/icons/material/Close';
import {PauseIcon} from '@ui/icons/material/Pause';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import clsx from 'clsx';
import {ReactElement, useContext, useState} from 'react';

export function QueueSidenav() {
  const queue = usePlayerStore(s => s.shuffledQueue);
  const miniPlayerIsHidden = useMiniPlayerIsHidden();
  const {setRightSidenavStatus} = useContext(DashboardLayoutContext);
  return (
    <div className="h-full">
      <div className="flex items-center justify-between gap-10 border-b border-divider-lighter py-6 pl-14 pr-6 text-sm font-semibold">
        <Trans message="Queue" />
        <IconButton size="sm" onClick={() => setRightSidenavStatus('closed')}>
          <CloseIcon />
        </IconButton>
      </div>
      <div
        className={clsx(
          'compact-scrollbar overflow-y-auto overflow-x-hidden',
          miniPlayerIsHidden ? 'h-full' : 'h-[calc(100%-260px)]',
        )}
      >
        {queue.map((media: MediaItem<Track>, index) => (
          // same media.id might be multiple times in the queue, use index as well to avoid errors
          <QueueItem key={`${media.id}-${index}`} media={media} />
        ))}
      </div>
    </div>
  );
}

interface QueueItemProps {
  media: MediaItem<Track>;
}
function QueueItem({media}: QueueItemProps) {
  const isCued = usePlayerStore(s => s.cuedMedia?.id === media.id);
  const isPlaying = useIsMediaPlaying(media.id);
  const [isHover, setHover] = useState(false);
  const isOffline = useIsOffline();
  const trackId = media.meta?.id;
  const isOfflined = useOfflineEntitiesStore(s =>
    trackId ? s.offlinedTrackIds.has(trackId) : false,
  );

  if (!media.meta) {
    return null;
  }

  return (
    <DialogTrigger type="popover" triggerOnContextMenu placement="bottom-start">
      <div
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        className={clsx(
          'flex items-center gap-10 border-b border-divider-lighter p-8',
          isCued && 'bg-primary/80 text-white',
          isOffline && !isOfflined && 'pointer-events-none opacity-50',
        )}
      >
        <div className="relative overflow-hidden">
          <TrackImage
            className="h-34 w-34 flex-shrink-0 rounded object-cover"
            track={media.meta}
          />
          {(isHover || isPlaying) && (
            <TogglePlaybackOverlay media={media} isHover={isHover} />
          )}
        </div>
        <div className="max-w-180 flex-auto whitespace-nowrap">
          <div className="overflow-hidden overflow-ellipsis text-sm">
            {media.meta.name}
          </div>
          <div className="flex items-center gap-4">
            <TrackOfflinedIndicator
              trackId={media.meta.id}
              className="text-muted"
            />
            <ArtistLinks
              className="overflow-hidden overflow-ellipsis text-xs"
              linkClassName={isCued ? 'text-inherit' : 'text-muted'}
              artists={media.meta.artists}
            />
          </div>
        </div>
      </div>
      <QueueTrackContextDialog queueItems={[media]} />
    </DialogTrigger>
  );
}

interface TogglePlaybackOverlayProps {
  media: MediaItem<Track>;
  isHover: boolean;
}
function TogglePlaybackOverlay({media, isHover}: TogglePlaybackOverlayProps) {
  const isPlaying = useIsMediaPlaying(media.id);
  const {trans} = useTrans();
  const player = usePlayerActions();

  if (!media.meta) {
    return null;
  }

  let button: ReactElement;

  if (isPlaying) {
    button = (
      <button
        aria-label={trans(
          message('Pause :name', {values: {name: media.meta.name}}),
        )}
        tabIndex={0}
        onClick={() => player.pause()}
      >
        {isHover ? <PauseIcon /> : <EqualizerImage color="white" />}
      </button>
    );
  } else {
    button = (
      <button
        aria-label={trans(
          message('Play :name', {values: {name: media.meta.name}}),
        )}
        tabIndex={0}
        onClick={() => player.play(media)}
      >
        <PlayArrowFilledIcon />
      </button>
    );
  }

  return (
    <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded bg-black/50 text-white">
      {button}
    </div>
  );
}
