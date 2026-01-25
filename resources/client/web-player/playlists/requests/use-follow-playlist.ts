import {appQueries} from '@app/app-queries';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {toast} from '@ui/toast/toast';

interface Response extends BackendResponse {
  playlist: PartialPlaylist;
}

export function useFollowPlaylist(playlist: PartialPlaylist) {
  return useMutation({
    mutationFn: () => followPlaylist(playlist.id),
    onSuccess: () => {
      toast(message('Following :name', {values: {name: playlist.name}}));
      queryClient.invalidateQueries({
        queryKey: appQueries.playlists.invalidateKey,
      });
    },
    onError: r => showHttpErrorToast(r),
  });
}

function followPlaylist(playlistId: number | string): Promise<Response> {
  return apiClient.post(`playlists/${playlistId}/follow`).then(r => r.data);
}
