import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {toast} from '@ui/toast/toast';

interface Response extends BackendResponse {}

interface Payload {
  user: {
    id: number;
    name: string;
  };
}

export function useUnfollowUser() {
  return useMutation({
    mutationFn: (payload: Payload) => unfollowUser(payload),
    onSuccess: async (response, {user}) => {
      await queryClient.invalidateQueries({queryKey: ['users']});
      toast(message('Stopped following :name', {values: {name: user.name}}));
    },
    onError: r => showHttpErrorToast(r),
  });
}

function unfollowUser({user}: Payload): Promise<Response> {
  return apiClient.post(`users/${user.id}/unfollow`).then(r => r.data);
}
