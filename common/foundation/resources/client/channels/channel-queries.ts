import {
  Channel,
  ChannelContentItem,
  ChannelLoader,
} from '@common/channels/channel';
import {ChannelQueryParams} from '@common/channels/use-channel-query-params';
import {validateDatatableSearch} from '@common/datatable/filters/utils/validate-datatable-search';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {
  getNextPageParam,
  PaginatedBackendResponse,
} from '@common/http/backend-response/pagination-response';
import {queryFactoryHelpers} from '@common/http/queries-file-helpers';
import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
} from '@tanstack/react-query';

export const channelQueries = {
  invalidateKey: ['channels'],
  index: (search: Record<string, string> = {}) => {
    const params = validateDatatableSearch(search);
    return queryOptions({
      placeholderData: keepPreviousData,
      queryKey: ['channels', params],
      queryFn: () =>
        queryFactoryHelpers.get<
          PaginatedBackendResponse<Channel> & {presets: any[]}
        >('channel', params),
    });
  },
  show: <T extends ChannelContentItem>(
    slugOrId: string | number,
    loader: ChannelLoader,
    queryParams: ChannelQueryParams,
  ) => {
    return queryOptions<{channel: Channel<T>} & BackendResponse>({
      queryKey: ['channels', 'show', `${slugOrId}`, loader, queryParams],
      queryFn: () =>
        queryFactoryHelpers.get(`channel/${slugOrId}`, {
          ...queryParams,
          loader,
        }),
    });
  },
  showInfinite: <T extends ChannelContentItem>(
    slugOrId: string | number,
    loader: ChannelLoader,
    queryParams: ChannelQueryParams,
  ) => {
    return infiniteQueryOptions<{channel: Channel<T>}>({
      queryKey: [
        'channels',
        'showInfinite',
        `${slugOrId}`,
        loader,
        queryParams,
      ],
      queryFn: ({pageParam, signal}) =>
        queryFactoryHelpers.get(
          `channel/${slugOrId}`,
          {
            ...queryParams,
            page: `${pageParam}`,
            loader,
          },
          signal,
        ),
      initialPageParam: 1,
      getNextPageParam: lastResponse => {
        if (!lastResponse.channel?.content) return 1;
        return getNextPageParam({pagination: lastResponse.channel.content});
      },
    });
  },
};
