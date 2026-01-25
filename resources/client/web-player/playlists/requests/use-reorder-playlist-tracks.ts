import {appQueries} from '@app/app-queries';
import {Track} from '@app/web-player/tracks/track';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {useMutation} from '@tanstack/react-query';
import {moveMultipleItemsInArray} from '@ui/utils/array/move-multiple-items-in-array';

interface Payload {
  tracks: Track[];
  oldIndexes: number | number[];
  newIndex: number;
}

export function useReorderPlaylistTracks() {
  const {playlistId} = useRequiredParams(['playlistId']);
  return useMutation({
    mutationFn: (payload: Payload) => reorderTracks(playlistId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: appQueries.playlists.show(playlistId).invalidateKey,
      });
    },
    onError: err => showHttpErrorToast(err),
  });
}

function reorderTracks(
  playlistId: number | string,
  {tracks, oldIndexes, newIndex}: Payload,
) {
  const ids = tracks.map(t => t.id);
  moveMultipleItemsInArray(ids, oldIndexes, newIndex);
  return apiClient
    .post(`playlists/${playlistId}/tracks/order`, {ids})
    .then(r => r.data);
}
