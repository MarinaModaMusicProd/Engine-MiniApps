import {
  Channel,
  ChannelContentItem,
  ChannelLoader,
} from '@common/channels/channel';
import {channelQueries} from '@common/channels/channel-queries';
import {
  ChannelQueryParams,
  useChannelQueryParams,
} from '@common/channels/use-channel-query-params';
import {useShowGlobalLoadingBar} from '@common/core/use-show-global-loading-bar';
import {hashKey, keepPreviousData, useQuery} from '@tanstack/react-query';
import {useRef} from 'react';

export function useChannelContent<
  T extends ChannelContentItem = ChannelContentItem,
>(
  channel: Channel<T>,
  loader: ChannelLoader,
  params?: ChannelQueryParams | null,
) {
  const queryParams = useChannelQueryParams(params);
  const queryOptions = channelQueries.show<T>(channel.id, loader, queryParams);

  const initialQueryKey = useRef(hashKey(queryOptions.queryKey)).current;

  const query = useQuery({
    ...queryOptions,
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    initialData: () => {
      if (
        hashKey(queryOptions.queryKey) === initialQueryKey &&
        channel.content
      ) {
        return {channel};
      }
      return undefined;
    },
  });

  useShowGlobalLoadingBar({isLoading: query.isPlaceholderData});

  return {
    query,
    queryKey: queryOptions.queryKey,
  };
}
