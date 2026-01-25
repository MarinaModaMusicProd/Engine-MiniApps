import {Channel, ChannelConfig} from '@common/channels/channel';
import {channelQueries} from '@common/channels/channel-queries';
import {onFormQueryError} from '@common/errors/on-form-query-error';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {PaginationResponse} from '@common/http/backend-response/pagination-response';
import {apiClient} from '@common/http/query-client';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {toast} from '@ui/toast/toast';
import {NormalizedModel} from '@ui/types/normalized-model';
import {UseFormReturn} from 'react-hook-form';

interface Response extends BackendResponse {
  channel: Channel;
}

export interface CreateChannelPayload {
  name: string;
  slug: string;
  type: string;
  public: boolean;
  description?: string;
  config: ChannelConfig;
  content: PaginationResponse<NormalizedModel>;
}

export function useCreateChannel(form: UseFormReturn<CreateChannelPayload>) {
  const {trans} = useTrans();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateChannelPayload) =>
      apiClient.post<Response>(`channel`, payload).then(r => r.data),
    onSuccess: async response => {
      await queryClient.invalidateQueries({
        queryKey: channelQueries.invalidateKey,
      });
      toast(trans(message('Channel created')));
      navigate(`/admin/channels/${response.channel.id}/edit`, {
        replace: true,
      });
    },
    onError: err => onFormQueryError(err, form),
  });
}
