import {appQueries} from '@app/app-queries';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {CreatePlaylistPayload} from '@app/web-player/playlists/requests/use-create-playlist';
import {onFormQueryError} from '@common/errors/on-form-query-error';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {toast} from '@ui/toast/toast';
import {UseFormReturn} from 'react-hook-form';
import {useParams} from 'react-router';

interface Response extends BackendResponse {
  playlist: PartialPlaylist;
}

interface UseUpdatePlaylistProps {
  form?: UseFormReturn<CreatePlaylistPayload>;
  playlistId?: number | string;
}
export function useUpdatePlaylist({
  form,
  playlistId,
}: UseUpdatePlaylistProps = {}) {
  const params = useParams();
  if (params.playlistId && !playlistId) {
    playlistId = params.playlistId;
  }
  return useMutation({
    mutationFn: (props: Partial<CreatePlaylistPayload>) =>
      updatePlaylist(playlistId!, props),
    onSuccess: () => {
      toast(message('Playlist updated'));
      queryClient.invalidateQueries({
        queryKey: appQueries.playlists.invalidateKey,
      });
    },
    onError: r => (form ? onFormQueryError(r, form) : showHttpErrorToast(r)),
  });
}

function updatePlaylist(
  playlistId: number | string,
  payload: Partial<CreatePlaylistPayload>,
): Promise<Response> {
  return apiClient.put(`playlists/${playlistId}`, payload).then(r => r.data);
}
