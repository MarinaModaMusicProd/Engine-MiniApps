import {Comment} from '@common/comments/comment';
import {Commentable} from '@common/comments/commentable';
import {validateCommentsDatatableParams} from '@common/comments/comments-datatable-page/validate-comments-datatable-params';
import {
  getNextPageParam,
  LengthAwarePaginationResponse,
  PaginatedBackendResponse,
} from '@common/http/backend-response/pagination-response';
import {queryFactoryHelpers} from '@common/http/queries-file-helpers';
import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
} from '@tanstack/react-query';

export const commentQueries = {
  invalidateKey: ['comments'],
  index: (search: Record<string, unknown>) => {
    const params = validateCommentsDatatableParams(search);
    return queryOptions({
      placeholderData: keepPreviousData,
      queryKey: ['comments', params],
      queryFn: () =>
        queryFactoryHelpers.get<PaginatedBackendResponse<Comment>>(
          'comment',
          params,
        ),
    });
  },
  commentable: (commentable: Commentable) => {
    const baseKey = ['comments', commentable.id, commentable.model_type];
    return {
      invalidateKey: baseKey,
      list: (perPage: number = 25) => {
        return infiniteQueryOptions<{
          pagination: LengthAwarePaginationResponse<Comment>;
        }>({
          queryKey: [...baseKey, `${perPage}`],
          queryFn: ({pageParam}) =>
            queryFactoryHelpers.get('commentable/comments', {
              page: pageParam as number,
              commentable_type: commentable.model_type,
              commentable_id: commentable.id,
              perPage: `${perPage}`,
            }),
          initialPageParam: 1,
          getNextPageParam: getNextPageParam,
        });
      },
    };
  },
};
