import {useMutation} from '@tanstack/react-query';
import {apiClient, queryClient} from '@common/http/query-client';
import {useTrans} from '@ui/i18n/use-trans';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {toast} from '@ui/toast/toast';
import {message} from '@ui/i18n/message';
import {Tag} from '@common/tags/tag';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {onFormQueryError} from '@common/errors/on-form-query-error';
import {UseFormReturn} from 'react-hook-form';
import {Subscription} from '@common/billing/subscription';

const endpoint = 'billing/subscriptions';

interface Response extends BackendResponse {
  tag: Tag;
}

interface Payload extends Partial<Subscription> {}

export function useCreateSubscription(form: UseFormReturn<Payload>) {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: (props: Payload) => createNewSubscription(props),
    onSuccess: () => {
      toast(trans(message('Subscription created')));
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey(endpoint),
      });
    },
    onError: err => onFormQueryError(err, form),
  });
}

function createNewSubscription(payload: Payload): Promise<Response> {
  return apiClient.post(endpoint, payload).then(r => r.data);
}
