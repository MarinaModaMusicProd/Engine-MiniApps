import {useOfflineEntitiesStore} from '@app/offline/offline-entities-store';
import {EqualizerImage} from '@app/web-player/tracks/equalizer-image/equalizer-image';
import {useIsTrackCued} from '@app/web-player/tracks/hooks/use-is-track-cued';
import {useIsTrackPlaying} from '@app/web-player/tracks/hooks/use-is-track-playing';
import {PlayArrowFilledIcon} from '@app/web-player/tracks/play-arrow-filled';
import {Track} from '@app/web-player/tracks/track';
import {useTrackTableMeta} from '@app/web-player/tracks/track-table/use-track-table-meta';
import {tracksToMediaItems} from '@app/web-player/tracks/utils/track-to-media-item';
import {useIsOffline} from '@app/web-player/use-is-offline';
import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {TableContext} from '@common/ui/tables/table-context';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {PauseIcon} from '@ui/icons/material/Pause';
import clsx from 'clsx';
import {useContext, useState} from 'react';

interface TogglePlaybackColumnProps {
  track: Track;
  rowIndex: number;
  isHovered: boolean;
}
export function TogglePlaybackColumn({
  track,
  rowIndex,
  isHovered,
}: TogglePlaybackColumnProps) {
  const {queueGroupId} = useTrackTableMeta();
  const isPlaying = useIsTrackPlaying(track.id, queueGroupId);
  const isCued = useIsTrackCued(track.id, queueGroupId);

  return (
    <div className="h-24 w-24 text-center">
      {isHovered || isPlaying ? (
        <TogglePlaybackButton
          track={track}
          trackIndex={rowIndex}
          isPlaying={isPlaying}
        />
      ) : (
        <span className={clsx(isCued ? 'text-primary' : 'text-muted')}>
          {rowIndex + 1}
        </span>
      )}
    </div>
  );
}

interface TogglePlaybackButtonProps {
  track: Track;
  trackIndex: number;
  isPlaying: boolean;
}
function TogglePlaybackButton({
  track,
  trackIndex,
  isPlaying,
}: TogglePlaybackButtonProps) {
  const {trans} = useTrans();
  const player = usePlayerActions();
  const {data} = useContext(TableContext);
  const {queueGroupId} = useTrackTableMeta();
  const [isHover, setHover] = useState(false);
  const isOffline = useIsOffline();
  const isOfflined = useOfflineEntitiesStore(s =>
    s.offlinedTrackIds.has(track.id),
  );
  const isDisabled = isOffline && !isOfflined;

  if (isPlaying) {
    return (
      <button
        disabled={isDisabled}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        aria-label={trans(message('Pause :name', {values: {name: track.name}}))}
        tabIndex={0}
        onClick={e => {
          e.stopPropagation();
          player.pause();
        }}
      >
        {isHover ? <PauseIcon /> : <EqualizerImage />}
      </button>
    );
  }

  return (
    <button
      disabled={isDisabled}
      aria-label={trans(message('Play :name', {values: {name: track.name}}))}
      tabIndex={0}
      onClick={async e => {
        e.stopPropagation();
        const newQueue = await tracksToMediaItems(
          data as Track[],
          queueGroupId as string,
        );
        player.overrideQueueAndPlay(newQueue, trackIndex);
      }}
    >
      <PlayArrowFilledIcon />
    </button>
  );
}
