import {PaginationResponse} from '@common/http/backend-response/pagination-response';
import {
  InfiniteData,
  UseInfiniteQueryResult,
  UseSuspenseInfiniteQueryResult,
} from '@tanstack/react-query';
import {useMemo} from 'react';

const stableArray: any[] = [];

export function useFlatInfiniteQueryItems<T>(
  query:
    | UseInfiniteQueryResult<InfiniteData<{pagination: PaginationResponse<T>}>>
    | UseSuspenseInfiniteQueryResult<
        InfiniteData<{pagination: PaginationResponse<T>}>
      >,
) {
  return useMemo(
    () =>
      query.data?.pages.flatMap(p => p.pagination.data) || (stableArray as T[]),
    [query.data?.pages],
  );
}
