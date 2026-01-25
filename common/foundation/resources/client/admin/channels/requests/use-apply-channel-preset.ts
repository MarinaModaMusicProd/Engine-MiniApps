import {channelQueries} from '@common/channels/channel-queries';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {toast} from '@ui/toast/toast';

interface Response extends BackendResponse {}

interface Payload {
  preset: string;
}

export function useApplyChannelPreset() {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: (payload: Payload) => resetChannels(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: channelQueries.invalidateKey,
      });
      toast(trans(message('Channel preset applied')));
    },
    onError: err => showHttpErrorToast(err),
  });
}

function resetChannels(payload: Payload) {
  return apiClient
    .post<Response>('channel/apply-preset', payload)
    .then(r => r.data);
}
