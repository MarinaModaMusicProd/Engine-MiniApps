import {useAuth} from '@common/auth/use-auth';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient} from '@common/http/query-client';
import {useQuery} from '@tanstack/react-query';

interface Response extends BackendResponse {
  ids: number[];
}

export function useFollowedUsers() {
  const {user} = useAuth();
  return useQuery<Response>({
    queryKey: ['users', 'followed', 'ids'],
    queryFn: () =>
      apiClient.get(`users/me/followed-users/ids`).then(r => r.data),
    enabled: !!user,
  });
}

export function useIsUserFollowing(userId: number) {
  const {data, isLoading} = useFollowedUsers();
  return {
    isLoading,
    isFollowing: !!data?.ids.includes(userId),
  };
}
