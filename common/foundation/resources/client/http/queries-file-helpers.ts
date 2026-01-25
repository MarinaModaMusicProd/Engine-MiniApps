import {validateDatatableSearch} from '@common/datatable/filters/utils/validate-datatable-search';
import {
  getNextPageParam,
  PaginatedBackendResponse,
  PaginationResponse,
} from '@common/http/backend-response/pagination-response';
import {apiClient} from '@common/http/query-client';
import {
  InfiniteData,
  infiniteQueryOptions,
  keepPreviousData,
  QueryKey,
  queryOptions,
} from '@tanstack/react-query';
import {useCallback} from 'react';

const get = async <T>(
  url: string,
  params?: Record<string, string | number | null | boolean>,
  signal?: AbortSignal,
): Promise<T> => {
  if (params?.query) {
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  return (await apiClient.get(url, {params, signal})).data;
};

const paginate = <R, S extends Record<string, string> = Record<string, string>>(
  uri: string,
  search: S = {} as S,
) => {
  const params = validateDatatableSearch(search);
  return queryOptions({
    placeholderData: keepPreviousData,
    queryKey: [uri, params],
    queryFn: () => get<PaginatedBackendResponse<R>>(uri, params),
  });
};

type InfiniteQueryOptions<T> = {
  queryKey: QueryKey;
  endpoint: string;
  queryParams?: Record<string, unknown>;
  initialPageParam?: unknown;
  getNextPageParam?: typeof getNextPageParam;
  initialData?: PaginationResponse<T> | undefined | null;
  keepPreviousData?: boolean;
  paginate?: 'simple' | 'lengthAware' | 'cursor';
  transformResponse?: (
    response: PaginatedBackendResponse<T>,
  ) => PaginatedBackendResponse<T>;
};
const infiniteQuery = <T>({
  queryKey,
  endpoint,
  queryParams,
  initialPageParam,
  initialData,
  keepPreviousData: propsKeepPreviousData,
  getNextPageParam: propsGetNextPageParam,
  transformResponse: propsTransformResponse,
  paginate = 'simple',
}: InfiniteQueryOptions<T>) => {
  const selectFn = propsTransformResponse
    ? useCallback((data: InfiniteData<PaginatedBackendResponse<T>>) => {
        const pages = data.pages.map(page => propsTransformResponse(page));
        return {...data, pages};
      }, [])
    : undefined;

  return infiniteQueryOptions<PaginatedBackendResponse<T>>({
    queryKey,
    queryFn: ({pageParam, signal}) =>
      get(
        endpoint,
        {
          ...queryParams,
          page: pageParam as number,
          paginate: paginate as string,
        },
        signal,
      ),
    placeholderData: propsKeepPreviousData ? keepPreviousData : undefined,
    initialPageParam: initialPageParam ?? 1,
    getNextPageParam: propsGetNextPageParam ?? getNextPageParam,
    select: selectFn,
    initialData: initialData
      ? () => {
          if (!initialData) return undefined;
          return {
            pageParams: [undefined, 1],
            pages: [{pagination: initialData}],
          };
        }
      : undefined,
  });
};

export const queryFactoryHelpers = {
  infiniteQuery,
  get,
  paginate,
};
