import {Track, TRACK_MODEL} from '@app/web-player/tracks/track';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {toast} from '@ui/toast/toast';

interface Response extends BackendResponse {
  track: Track;
}

export interface ImportTrackPayload {
  spotifyId: string;
  importLyrics: boolean;
}

export function useImportTrack() {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: (props: ImportTrackPayload) => importTrack(props),
    onSuccess: () => {
      toast(trans(message('Track imported')));
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('tracks'),
      });
    },
    onError: err => showHttpErrorToast(err),
  });
}

function importTrack(payload: ImportTrackPayload): Promise<Response> {
  return apiClient
    .post('import-media/single-item', {
      modelType: TRACK_MODEL,
      spotifyId: payload.spotifyId,
      importLyrics: payload.importLyrics,
    })
    .then(r => r.data);
}
