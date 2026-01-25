import {appQueries} from '@app/app-queries';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {Track} from '@app/web-player/tracks/track';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {toast} from '@ui/toast/toast';

interface Response extends BackendResponse {
  playlist: PartialPlaylist;
}

interface Payload {
  playlistId: number;
  tracks: Track[];
}

export function useRemoveTracksFromPlaylist() {
  return useMutation({
    mutationFn: (payload: Payload) => removeTracks(payload),
    onSuccess: (response, {tracks}) => {
      toast(
        message('Removed [one 1 track|other :count tracks] from playlist', {
          values: {count: tracks.length},
        }),
      );
      queryClient.invalidateQueries({
        queryKey: appQueries.playlists.show(response.playlist.id).invalidateKey,
      });
    },
    onError: r => showHttpErrorToast(r),
  });
}

function removeTracks(payload: Payload): Promise<Response> {
  const backendPayload = {
    ids: payload.tracks.map(track => track.id),
  };
  return apiClient
    .post(`playlists/${payload.playlistId}/tracks/remove`, backendPayload)
    .then(r => r.data);
}
