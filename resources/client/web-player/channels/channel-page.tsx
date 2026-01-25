import {ChannelContentModel} from '@app/admin/channels/channel-content-config';
import {ChannelContent} from '@app/web-player/channels/channel-content';
import {PlayerPageHeaderGradient} from '@app/web-player/layout/player-page-header-gradient';
import {PlayerPageSuspense} from '@app/web-player/layout/player-page-suspsense';
import {AdHost} from '@common/admin/ads/ad-host';
import {Channel} from '@common/channels/channel';
import {useChannel} from '@common/channels/requests/use-channel';
import {PageMetaTags} from '@common/http/page-meta-tags';
import {useMemo} from 'react';

type Props = {
  slugOrId?: string | number;
};
export function Component({slugOrId}: Props) {
  return (
    <PlayerPageSuspense>
      <ChannelPage slugOrId={slugOrId} />
    </PlayerPageSuspense>
  );
}

function ChannelPage({slugOrId}: Props) {
  const query = useChannel(slugOrId, 'channelPage');

  const randomImage = useMemo(() => {
    return getRandomImage(query.data.channel as Channel<ChannelContentModel>);
  }, [query.data.channel]);

  return (
    <>
      <PageMetaTags query={query} />
      {randomImage ? (
        <PlayerPageHeaderGradient image={randomImage} height="h-[20vh]" />
      ) : null}
      <div className="relative pb-24">
        <AdHost slot="general_top" className="mb-34" />
        <ChannelContent
          channel={query.data.channel as Channel<ChannelContentModel>}
          // set key to force re-render when channel changes
          key={query.data.channel.id}
        />
        <AdHost slot="general_bottom" className="mt-34" />
      </div>
    </>
  );
}

function getRandomImage(
  channel: Channel<ChannelContentModel>,
): string | undefined {
  const content = channel.content?.data ?? [];
  for (const item of content) {
    if (item.model_type === 'channel') {
      return getRandomImage(item as Channel<ChannelContentModel>);
    }
    if (item.model_type === 'artist' && item.image_small) {
      return item.image_small;
    }
    if (item.model_type === 'album' && item.image) {
      return item.image;
    }
    if (item.model_type === 'track' && item.image) {
      if (item.image) {
        return item.image;
      } else if (item.album?.image) {
        return item.album.image;
      }
    }
    if (item.model_type === 'genre' && item.image) {
      return item.image;
    }
    if (item.model_type === 'playlist' && item.image) {
      return item.image;
    }
    if (item.model_type === 'user' && item.image) {
      return item.image;
    }
  }
}
