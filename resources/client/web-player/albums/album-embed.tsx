import {appQueries} from '@app/app-queries';
import {FullAlbum} from '@app/web-player/albums/album';
import {AlbumListItem} from '@app/web-player/albums/album-list/album-list-item';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {playerStoreOptions} from '@app/web-player/state/player-store-options';
import {Track} from '@app/web-player/tracks/track';
import {tracksToMediaItems} from '@app/web-player/tracks/utils/track-to-media-item';
import {MediaItem} from '@common/player/media-item';
import {PlayerContext} from '@common/player/player-context';
import {PlayerStoreOptions} from '@common/player/state/player-store-options';
import {PlayerPoster} from '@common/player/ui/controls/player-poster';
import {PlayerOutlet} from '@common/player/ui/player-outlet';
import {useSuspenseQuery} from '@tanstack/react-query';
import {useEffect, useMemo, useState} from 'react';
import {useParams} from 'react-router';

export function Component() {
  const {albumId} = useParams();
  const {data} = useSuspenseQuery(appQueries.albums.get(albumId!, 'albumPage'));

  const [mediaItems, setMediaItems] = useState<MediaItem<Track>[]>([]);
  useEffect(() => {
    if (data.album.tracks?.length) {
      tracksToMediaItems(data.album.tracks, undefined, data.album).then(items =>
        setMediaItems(items),
      );
    }
  }, [data]);

  return (
    <div className="h-384 rounded border bg-alt p-14">
      {mediaItems.length ? (
        <EmbedContent album={data.album} mediaItems={mediaItems} />
      ) : null}
    </div>
  );
}

interface EmbedContentProps {
  album: FullAlbum;
  mediaItems: MediaItem<Track>[];
}
function EmbedContent({album, mediaItems}: EmbedContentProps) {
  const options: PlayerStoreOptions = useMemo(() => {
    return {
      ...playerStoreOptions,
      initialData: {
        queue: mediaItems,
        cuedMediaId: queueGroupId(album),
        state: {
          repeat: false,
        },
      },
    };
  }, [album]);
  return (
    <PlayerContext id="web-player" options={options}>
      <div className="flex h-full items-start gap-24">
        <div className="relative h-144 w-144 flex-shrink-0 overflow-hidden rounded bg-black">
          <PlayerPoster className="absolute inset-0" />
          <PlayerOutlet className="h-full w-full" />
        </div>
        <AlbumListItem
          album={album}
          maxHeight="h-full"
          className="flex-auto"
          hideArtwork
          hideActions
          linksInNewTab
        />
      </div>
    </PlayerContext>
  );
}
