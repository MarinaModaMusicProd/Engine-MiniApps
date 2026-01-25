import {Channel, ChannelConfig} from '@common/channels/channel';
import {channelQueries} from '@common/channels/channel-queries';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {toast} from '@ui/toast/toast';
import {NormalizedModel} from '@ui/types/normalized-model';

interface Response extends BackendResponse {
  channel: Channel<NormalizedModel>;
}

interface Payload {
  channelConfig?: Partial<ChannelConfig>;
}

export function useUpdateChannelContent(channelId: number | string) {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: (payload: Payload) => updateChannel(channelId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: channelQueries.invalidateKey,
      });
      toast(trans(message('Channel content updated')));
    },
    onError: err => showHttpErrorToast(err),
  });
}

function updateChannel(channelId: number | string, payload: Payload) {
  return apiClient
    .post<Response>(`channel/${channelId}/update-content`, {
      ...payload,
      normalizeContent: true,
    })
    .then(r => r.data);
}
