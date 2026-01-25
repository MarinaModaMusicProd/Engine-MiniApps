import {Channel} from '@common/channels/channel';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation} from '@tanstack/react-query';
import {NormalizedModel} from '@ui/types/normalized-model';

interface Response extends BackendResponse {
  channel: Channel<NormalizedModel>;
}

interface Payload {
  channelId: number | string;
  modelType: string;
  ids: (number | string)[];
}

export function useReorderChannelContent() {
  return useMutation({
    mutationFn: ({channelId, modelType, ids}: Payload) =>
      apiClient
        .post<Response>(`channel/${channelId}/reorder-content`, {
          modelType,
          ids,
        })
        .then(r => r.data),
    onError: err => showHttpErrorToast(err),
  });
}
