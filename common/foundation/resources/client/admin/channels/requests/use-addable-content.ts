import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient} from '@common/http/query-client';
import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {NormalizedModel} from '@ui/types/normalized-model';

interface SearchResponse extends BackendResponse {
  results: NormalizedModel[];
}

interface SearchParams {
  query?: string;
  limit?: number;
  modelType: string;
}

export function useAddableContent(params: SearchParams) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () =>
      apiClient
        .get<SearchResponse>(`channel/search-for-addable-content`, {params})
        .then(response => response.data),
    placeholderData: params.query ? keepPreviousData : undefined,
  });
}
