import {billingQueries} from '@common/billing/billing-queries';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {useMutation} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {toast} from '@ui/toast/toast';
import {User} from '@ui/types/user';

interface Response extends BackendResponse {
  user: User;
}

interface Payload {
  subscriptionId: number;
  newProductId: number;
  newPriceId: number;
}

export function useChangeSubscriptionPlan() {
  const {trans} = useTrans();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (props: Payload) => changePlan(props),
    onSuccess: () => {
      toast(trans(message('Plan changed.')));
      queryClient.invalidateQueries({queryKey: billingQueries.user().queryKey});
      navigate('/billing');
    },
    onError: err => showHttpErrorToast(err),
  });
}

function changePlan({subscriptionId, ...other}: Payload): Promise<Response> {
  return apiClient
    .post(`billing/subscriptions/${subscriptionId}/change-plan`, other)
    .then(r => r.data);
}
