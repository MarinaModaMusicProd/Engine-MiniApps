import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {toast} from '@ui/toast/toast';

interface Payload {
  user: {
    id: number;
    name: string;
  };
}

export function useFollowUser() {
  return useMutation({
    mutationFn: (payload: Payload) =>
      apiClient.post(`users/${payload.user.id}/follow`).then(r => r.data),
    onSuccess: async (response, {user}) => {
      await queryClient.invalidateQueries({queryKey: ['users']});
      toast(message('Following :name', {values: {name: user.name}}));
    },
    onError: r => showHttpErrorToast(r),
  });
}
