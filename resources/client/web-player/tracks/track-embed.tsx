import {appQueries} from '@app/app-queries';
import {playerStoreOptions} from '@app/web-player/state/player-store-options';
import {Track} from '@app/web-player/tracks/track';
import {TrackListItem} from '@app/web-player/tracks/track-list/track-list-item';
import {trackToMediaItem} from '@app/web-player/tracks/utils/track-to-media-item';
import {MediaItem} from '@common/player/media-item';
import {PlayerContext} from '@common/player/player-context';
import {PlayerStoreOptions} from '@common/player/state/player-store-options';
import {PlayerPoster} from '@common/player/ui/controls/player-poster';
import {PlayerOutlet} from '@common/player/ui/player-outlet';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {useSuspenseQuery} from '@tanstack/react-query';
import {useEffect, useMemo, useState} from 'react';

export function Component() {
  const {trackId} = useRequiredParams(['trackId']);
  const {data} = useSuspenseQuery(appQueries.tracks.get(trackId, 'trackPage'));

  const [mediaItem, setMediaItem] = useState<MediaItem<Track> | null>(null);
  useEffect(() => {
    trackToMediaItem(data.track).then(setMediaItem);
  }, [data]);

  return (
    <div className="h-[174px] rounded border bg-alt p-14">
      {mediaItem ? (
        <EmbedContent track={data.track} mediaItem={mediaItem} />
      ) : null}
    </div>
  );
}

interface EmbedContentProps {
  track: Track;
  mediaItem: MediaItem<Track>;
}
function EmbedContent({track, mediaItem}: EmbedContentProps) {
  const options: PlayerStoreOptions = useMemo(() => {
    return {
      ...playerStoreOptions,
      initialData: {
        queue: [mediaItem],
        cuedMediaId: mediaItem.id,
        state: {
          repeat: false,
        },
      },
    };
  }, [track]);
  return (
    <PlayerContext id="web-player" options={options}>
      <div className="flex gap-24">
        <div className="relative h-144 w-144 flex-shrink-0 overflow-hidden rounded bg-black">
          <PlayerPoster className="absolute inset-0" />
          <PlayerOutlet className="h-full w-full" />
        </div>
        <TrackListItem
          track={track}
          hideArtwork
          hideActions
          linksInNewTab
          className="flex-auto"
        />
      </div>
    </PlayerContext>
  );
}
