import {PartialAlbum} from '@app/web-player/albums/album';
import {userReposts} from '@app/web-player/library/state/reposts-store';
import {Track} from '@app/web-player/tracks/track';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation} from '@tanstack/react-query';

interface Response extends BackendResponse {
  action: 'added' | 'removed';
}

interface Payload {
  repostable: Track | PartialAlbum;
}

export function useToggleRepost() {
  return useMutation({
    mutationFn: (payload: Payload) => toggleRepost(payload),
    onSuccess: (response, {repostable}) => {
      if (response.action === 'added') {
        userReposts().add([repostable]);
      } else {
        userReposts().remove([repostable]);
      }
      queryClient.invalidateQueries({queryKey: ['reposts']});
    },
    onError: r => showHttpErrorToast(r),
  });
}

function toggleRepost({repostable}: Payload): Promise<Response> {
  const payload = {
    repostable_id: repostable.id,
    repostable_type: repostable.model_type,
  };
  return apiClient.post('reposts/toggle', payload).then(r => r.data);
}
