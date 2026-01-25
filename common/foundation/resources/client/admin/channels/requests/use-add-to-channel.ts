import {channelQueries} from '@common/channels/channel-queries';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation} from '@tanstack/react-query';
import {NormalizedModel} from '@ui/types/normalized-model';

interface Response extends BackendResponse {}

interface Payload {
  channelId: number | string;
  item: NormalizedModel;
}

export function useAddToChannel() {
  return useMutation({
    mutationFn: (payload: Payload) => addToChannel(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: channelQueries.invalidateKey,
      });
    },
    onError: r => showHttpErrorToast(r),
  });
}

function addToChannel({channelId, item}: Payload): Promise<Response> {
  return apiClient
    .post(`channel/${channelId}/add`, {
      itemId: item.id,
      itemType: item.model_type,
    })
    .then(r => r.data);
}
