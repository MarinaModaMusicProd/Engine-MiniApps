import {useBackendFilterUrlParams} from '@common/datatable/filters/backend-filter-url-params';
import {BackendFiltersUrlKey} from '@common/datatable/filters/backend-filters-url-key';
import {removeEmptyValuesFromObject} from '@ui/utils/objects/remove-empty-values-from-object';
import {useParams, useSearchParams} from 'react-router';

export type ChannelQueryParams = {
  restriction?: string | null;
  page?: string | null;
  perPage?: string | null;
  query?: string | null;
  order?: string | null;
  [BackendFiltersUrlKey]?: string | null;
};

export function useChannelQueryParams(
  userParams?: ChannelQueryParams | null,
): ChannelQueryParams {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const {encodedFilters} = useBackendFilterUrlParams();

  return validateChannelQueryParams({
    restriction: searchParams.get('restriction') ?? params.restriction,
    page: searchParams.get('page') ?? userParams?.page,
    perPage: searchParams.get('perPage') ?? userParams?.perPage,
    query: searchParams.get('query') ?? userParams?.query,
    order: searchParams.get('order') ?? userParams?.order,
    [BackendFiltersUrlKey]: encodedFilters,
  });
}

export function validateChannelQueryParams(
  params: Record<string, any>,
): ChannelQueryParams {
  return removeEmptyValuesFromObject({
    restriction: params.restriction ?? '',
    page: params.page ?? '1',
    perPage: params.perPage ?? null,
    query: params.query ?? null,
    order: params.order ?? null,
    [BackendFiltersUrlKey]: params[BackendFiltersUrlKey] ?? null,
  });
}
