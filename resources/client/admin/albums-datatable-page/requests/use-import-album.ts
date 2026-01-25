import {ALBUM_MODEL, PartialAlbum} from '@app/web-player/albums/album';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {toast} from '@ui/toast/toast';

interface Response extends BackendResponse {
  album: PartialAlbum;
}

export interface ImportAlbumPayload {
  spotifyId: string;
}

export function useImportAlbum() {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: (props: ImportAlbumPayload) => importAlbum(props),
    onSuccess: () => {
      toast(trans(message('Album imported')));
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('albums'),
      });
    },
    onError: err => showHttpErrorToast(err),
  });
}

function importAlbum(payload: ImportAlbumPayload): Promise<Response> {
  return apiClient
    .post('import-media/single-item', {
      modelType: ALBUM_MODEL,
      spotifyId: payload.spotifyId,
    })
    .then(r => r.data);
}
