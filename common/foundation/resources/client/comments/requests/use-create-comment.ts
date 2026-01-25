import {Comment} from '@common/comments/comment';
import {commentQueries} from '@common/comments/comment-queries';
import {Commentable} from '@common/comments/commentable';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {toast} from '@ui/toast/toast';

interface Response extends BackendResponse {
  //
}

export interface CreateCommentPayload {
  commentable: Commentable;
  content: string;
  inReplyTo?: Comment;
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (props: CreateCommentPayload) => createComment(props),
    onSuccess: async (response, props) => {
      await queryClient.invalidateQueries({
        queryKey: commentQueries.commentable(props.commentable).invalidateKey,
      });
      toast(message('Comment posted'));
    },
    onError: err => showHttpErrorToast(err),
  });
}

function createComment({
  commentable,
  content,
  inReplyTo,
  ...other
}: CreateCommentPayload): Promise<Response> {
  const payload = {
    commentable_id: commentable.id,
    commentable_type: commentable.model_type,
    content,
    inReplyTo,
    ...other,
  };
  return apiClient.post('comment', payload).then(r => r.data);
}
