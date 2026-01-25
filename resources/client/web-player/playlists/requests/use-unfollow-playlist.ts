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

export function useUnfollowPlaylist(playlist: PartialPlaylist) {
  return useMutation({
    mutationFn: () => unfollowPlaylist(playlist.id),
    onSuccess: () => {
      toast(
        message('Stopped following :name', {values: {name: playlist.name}}),
      );
      queryClient.invalidateQueries({
        queryKey: appQueries.playlists.invalidateKey,
      });
    },
    onError: r => showHttpErrorToast(r),
  });
}

function unfollowPlaylist(playlistId: number | string): Promise<Response> {
  return apiClient.post(`playlists/${playlistId}/unfollow`).then(r => r.data);
}
