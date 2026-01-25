import {
  PartialPlaylist,
  PLAYLIST_MODEL,
} from '@app/web-player/playlists/playlist';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {toast} from '@ui/toast/toast';

interface Response extends BackendResponse {
  playlist: PartialPlaylist;
}

export interface ImportPlaylistPayload {
  spotifyId: string;
}

export function useImportPlaylist() {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: (props: ImportPlaylistPayload) => importArtists(props),
    onSuccess: () => {
      toast(trans(message('Playlist imported')));
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('playlists'),
      });
    },
    onError: err => showHttpErrorToast(err),
  });
}

function importArtists(payload: ImportPlaylistPayload): Promise<Response> {
  return apiClient
    .post('import-media/single-item', {
      modelType: PLAYLIST_MODEL,
      spotifyId: payload.spotifyId,
    })
    .then(r => r.data);
}
