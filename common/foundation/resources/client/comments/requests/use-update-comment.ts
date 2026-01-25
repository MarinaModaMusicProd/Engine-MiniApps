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
  commentId: number;
  content: string;
}

export function useUpdateComment() {
  return useMutation({
    mutationFn: (props: Payload) => updateComment(props),
    onSuccess: () => {
      toast(message('Comment updated'));
      queryClient.invalidateQueries({queryKey: commentQueries.invalidateKey});
    },
    onError: err => showHttpErrorToast(err),
  });
}

function updateComment({commentId, content}: Payload): Promise<Response> {
  return apiClient.put(`comment/${commentId}`, {content}).then(r => r.data);
}
