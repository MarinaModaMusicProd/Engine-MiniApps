import {castObjectValuesToString} from '@ui/utils/objects/cast-object-values-to-string';

export type CommentsDatatableSearchParams = {
  page: string;
  perPage: string;
  query: string;
  filters: string;
  with: string;
  withCount: string;
  commentableType: string;
  commentableId: string;
};

export const validateCommentsDatatableParams = (
  search: Record<string, unknown>,
): CommentsDatatableSearchParams => {
  return castObjectValuesToString({
    page: search.page || '1',
    perPage: search.perPage || '15',
    query: search.query || '',
    filters: search.filters || '',
    with: search.with || 'commentable',
    withCount: search.withCount || 'reports',
    commentableType: search.commentableType || '',
    commentableId: search.commentableId || '',
  });
};
