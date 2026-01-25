import {Channel, ChannelContentItem} from '@common/channels/channel';
import {channelQueries} from '@common/channels/channel-queries';
import {useChannelQueryParams} from '@common/channels/use-channel-query-params';
import {
  hashKey,
  keepPreviousData,
  useInfiniteQuery,
} from '@tanstack/react-query';
import {useMemo, useRef} from 'react';

export function useInfiniteChannelContent<
  T extends ChannelContentItem = ChannelContentItem,
>(channel: Channel<T>) {
  const queryParams = useChannelQueryParams();

  const queryOptions = channelQueries.showInfinite<T>(
    channel.id,
    'channelPage',
    queryParams,
  );

  const initialQueryKey = useRef(hashKey(queryOptions.queryKey)).current;

  const query = useInfiniteQuery({
    ...queryOptions,
    placeholderData: keepPreviousData,
    initialData: () => {
      if (
        !channel.content ||
        hashKey(queryOptions.queryKey) !== initialQueryKey
      ) {
        return undefined;
      }

      return {
        pageParams: [undefined, 1],
        pages: [{channel}],
      };
    },
  });

  const items = useMemo(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.reduce((acc, page) => {
      const content = page.channel?.content?.data ?? [];
      return [...acc, ...content];
    }, [] as T[]);
  }, [query.data?.pages]);

  return {
    query,
    items,
  };
}
