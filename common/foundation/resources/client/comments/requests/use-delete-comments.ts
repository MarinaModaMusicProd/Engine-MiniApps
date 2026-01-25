import {commentQueries} from '@common/comments/comment-queries';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {toast} from '@ui/toast/toast';

interface Response extends BackendResponse {
  //
}

interface Payload {
  commentIds: number[];
}

export function useDeleteComments() {
  return useMutation({
    mutationFn: (payload: Payload) => deleteComments(payload),
    onSuccess: (response, payload) => {
      queryClient.invalidateQueries({queryKey: commentQueries.invalidateKey});
      toast(
        message('[one Comment deleted|other Deleted :count comments]', {
          values: {count: payload.commentIds.length},
        }),
      );
    },
    onError: err => showHttpErrorToast(err),
  });
}

function deleteComments({commentIds}: Payload): Promise<Response> {
  return apiClient.delete(`comment/${commentIds.join(',')}`).then(r => r.data);
}
