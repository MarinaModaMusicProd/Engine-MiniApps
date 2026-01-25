import {useOfflineEntitiesStore} from '@app/offline/offline-entities-store';
import {CheckCircleFilledIcon} from '@ui/icons/check-circle-filled';

type TrackOfflinedIndicatorProps = {
  trackId: number;
  className?: string;
};
export function TrackOfflinedIndicator({
  trackId,
  className,
}: TrackOfflinedIndicatorProps) {
  const isOfflined = useOfflineEntitiesStore(s => s.isTrackOfflined(trackId));
  return isOfflined ? (
    <CheckCircleFilledIcon size="xs" className={className} />
  ) : null;
}

type AlbumOfflinedIndicatorProps = {
  albumId: number;
  className?: string;
};
export function AlbumOfflinedIndicator({
  albumId,
  className,
}: AlbumOfflinedIndicatorProps) {
  const isOfflined = useOfflineEntitiesStore(s =>
    s.offlinedAlbumIds.has(albumId),
  );
  return isOfflined ? (
    <CheckCircleFilledIcon size="xs" className={className} />
  ) : null;
}

type PlaylistOfflinedIndicatorProps = {
  playlistId: number;
  className?: string;
};
export function PlaylistOfflinedIndicator({
  playlistId,
  className,
}: PlaylistOfflinedIndicatorProps) {
  const isOfflined = useOfflineEntitiesStore(s =>
    s.offlinedPlaylistIds.has(playlistId),
  );
  return isOfflined ? (
    <CheckCircleFilledIcon size="xs" className={className} />
  ) : null;
}
