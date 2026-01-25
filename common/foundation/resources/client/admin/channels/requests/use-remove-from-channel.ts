import {channelQueries} from '@common/channels/channel-queries';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation} from '@tanstack/react-query';
import {NormalizedModel} from '@ui/types/normalized-model';

interface Payload {
  channelId: number | string;
  item: NormalizedModel;
}

export function useRemoveFromChannel() {
  return useMutation({
    mutationFn: (payload: Payload) => removeFromChannel(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: channelQueries.invalidateKey,
      });
    },
    onError: r => showHttpErrorToast(r),
  });
}

function removeFromChannel({channelId, item}: Payload) {
  return apiClient
    .post(`channel/${channelId}/remove`, {
      itemId: item.id,
      itemType: item.model_type,
    })
    .then(r => r.data);
}
