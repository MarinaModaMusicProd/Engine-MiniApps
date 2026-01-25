import {ARTIST_MODEL, PartialArtist} from '@app/web-player/artists/artist';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {toast} from '@ui/toast/toast';

interface Response extends BackendResponse {
  artist: PartialArtist;
}

export interface ImportArtistPayload {
  spotifyId: string;
  importSimilarArtists: boolean;
  importAlbums: boolean;
}

export function useImportArtist() {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: (props: ImportArtistPayload) => importArtists(props),
    onSuccess: () => {
      toast(trans(message('Artist imported')));
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('artists'),
      });
    },
    onError: err => showHttpErrorToast(err),
  });
}

function importArtists(payload: ImportArtistPayload): Promise<Response> {
  return apiClient
    .post('import-media/single-item', {
      modelType: ARTIST_MODEL,
      spotifyId: payload.spotifyId,
      importSimilarArtists: payload.importSimilarArtists,
      importAlbums: payload.importAlbums,
    })
    .then(r => r.data);
}
