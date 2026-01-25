import {channelQueries} from '@common/channels/channel-queries';
import {
  ChannelQueryParams,
  useChannelQueryParams,
} from '@common/channels/use-channel-query-params';
import {useSuspenseQuery} from '@tanstack/react-query';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {useParams} from 'react-router';

export function useChannel(
  propsSlugOrId: string | number | undefined,
  loader: 'channelPage' | 'editChannelPage' | 'editUserListPage',
  userParams?: ChannelQueryParams | null,
) {
  const params = useParams();
  const slugOrId = propsSlugOrId || params.slugOrId!;
  const queryParams = useChannelQueryParams(userParams);

  return useSuspenseQuery({
    ...channelQueries.show(slugOrId, loader, queryParams),
    staleTime: Infinity,
    initialData: () => {
      const data = (getBootstrapData().loaders as any)?.[loader];

      const isSameChannel =
        data?.channel.id == slugOrId || data?.channel.slug == slugOrId;
      const isSameRestriction =
        !queryParams.restriction ||
        data?.channel.restriction?.name === queryParams.restriction;

      if (isSameChannel && isSameRestriction) {
        return data;
      }
    },
  });
}
