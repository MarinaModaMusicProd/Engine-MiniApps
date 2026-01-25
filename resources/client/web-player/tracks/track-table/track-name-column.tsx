import {TrackOfflinedIndicator} from '@app/offline/entitiy-offline-indicator-icon';
import {useIsTrackCued} from '@app/web-player/tracks/hooks/use-is-track-cued';
import {Track} from '@app/web-player/tracks/track';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {useTrackTableMeta} from '@app/web-player/tracks/track-table/use-track-table-meta';
import {Skeleton} from '@ui/skeleton/skeleton';
import clsx from 'clsx';

interface TrackNameColumnProps {
  track: Track;
}
export function TrackNameColumn({track}: TrackNameColumnProps) {
  const {hideTrackImage, queueGroupId} = useTrackTableMeta();
  const isCued = useIsTrackCued(track.id, queueGroupId);

  return (
    <div className="flex items-center gap-12">
      {!hideTrackImage && (
        <TrackImage
          className="h-40 w-40 flex-shrink-0 rounded object-cover"
          track={track}
        />
      )}
      <div className="min-w-0 overflow-hidden">
        <div
          className={clsx(
            'overflow-hidden overflow-ellipsis',
            isCued && 'text-primary',
            'text-sm',
          )}
        >
          {track.name}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted">
          <TrackOfflinedIndicator trackId={track.id} />
          {track.artists?.length ? (
            <div className="overflow-hidden overflow-ellipsis text-sm">
              {track.artists?.map(a => a.name).join(', ')}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function TrackNameColumnPlaceholder() {
  const {hideTrackImage} = useTrackTableMeta();
  return (
    <div className="flex w-full max-w-4/5 items-center gap-12">
      {!hideTrackImage && (
        <Skeleton size="w-40 h-40" variant="rect" radius="rounded" />
      )}
      <div className="min-w-0 flex-auto">
        <div className="leading-3">
          <Skeleton />
        </div>
        <div className="mt-4 max-w-[60%] leading-3 text-muted">
          <Skeleton />
        </div>
      </div>
    </div>
  );
}
