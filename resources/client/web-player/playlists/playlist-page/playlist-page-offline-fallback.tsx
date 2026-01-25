import {offlinedEntitiesStore} from '@app/offline/offline-entities-store';
import {offlinedMediaItems} from '@app/offline/offline-media-items';
import {offlinedTracks} from '@app/offline/offlined-tracks';
import {PlayerPageErrorMessage} from '@app/web-player/layout/player-page-error-message';
import {FullPlaylist} from '@app/web-player/playlists/playlist';
import {PlaylistPageHeader} from '@app/web-player/playlists/playlist-page/playlist-page-header';
import {PlaylistTableRow} from '@app/web-player/playlists/playlist-page/playlist-table-row';
import {GetPlaylistResponse} from '@app/web-player/playlists/requests/get-playlist-response';
import {VirtualTableBody} from '@app/web-player/playlists/virtual-table-body';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {TrackTable} from '@app/web-player/tracks/track-table/track-table';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {useEffect, useState} from 'react';

export function PlaylistPageOfflineFallback() {
  const [data, setData] = useState<GetPlaylistResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {playlistId} = useRequiredParams(['playlistId']);
  useEffect(() => {
    getOfflinedPlaylistData(+playlistId)
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [playlistId]);

  if (data) {
    const queueId = queueGroupId(data.playlist);
    return (
      <div>
        <PlaylistPageHeader
          playlist={data.playlist}
          totalDuration={data.totalDuration}
          queueId={queueId}
        />
        <TrackTable
          queueGroupId={queueId}
          tracks={data.tracks.data}
          renderRowAs={PlaylistTableRow}
          playlist={data.playlist}
          tableBody={
            <VirtualTableBody
              query={null}
              totalItems={data.tracks.data.length}
            />
          }
        />
      </div>
    );
  }

  return isLoading ? null : <PlayerPageErrorMessage />;
}

async function getOfflinedPlaylistData(
  playlistId: number,
): Promise<GetPlaylistResponse | null> {
  if (!offlinedEntitiesStore().offlinedPlaylistIds.has(playlistId)) {
    return null;
  }

  const item = await offlinedMediaItems.getPlaylistById(playlistId);
  const playlist = item?.data as FullPlaylist;
  if (!playlist) {
    return null;
  }

  const tracks = (await offlinedTracks.getTracksOfflinedBy(playlist)).map(
    track => track.data,
  );
  if (!tracks.length) {
    return null;
  }

  return {
    loader: 'playlistPage',
    playlist,
    tracks: {
      current_page: 1,
      per_page: tracks.length,
      from: 1,
      to: tracks.length,
      total: tracks.length,
      data: tracks,
    },
    totalDuration: tracks.reduce(
      (acc, track) => acc + (track.duration || 0),
      0,
    ),
  };
}
