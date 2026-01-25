import {ChannelContentModel} from '@app/admin/channels/channel-content-config';
import {ALBUM_MODEL, FullAlbum} from '@app/web-player/albums/album';
import {ChannelContentCarousel} from '@app/web-player/channels/channel-content-carousel';
import {ChannelContentGrid} from '@app/web-player/channels/channel-content-grid';
import {ChannelContentList} from '@app/web-player/channels/channel-content-list';
import {ChannelHeading} from '@app/web-player/channels/channel-heading';
import {ChannelTrackTable} from '@app/web-player/channels/channel-track-table';
import {Track, TRACK_MODEL} from '@app/web-player/tracks/track';
import {Channel, CHANNEL_MODEL} from '@common/channels/channel';
import {Fragment} from 'react';

export interface ChannelContentProps<
  T extends ChannelContentModel = ChannelContentModel,
> {
  channel: Channel<T>;
  isNested?: boolean;
}
export function ChannelContent(props: ChannelContentProps) {
  const {channel, isNested} = props;
  const contentModel = channel.config.contentModel;
  const layout = isNested ? channel.config.nestedLayout : channel.config.layout;
  if (!channel.content) {
    return null;
  }

  if (contentModel === TRACK_MODEL && layout === 'list') {
    return <ChannelContentList {...(props as ChannelContentProps<Track>)} />;
  } else if (contentModel === ALBUM_MODEL && layout === 'list') {
    return (
      <ChannelContentList {...(props as ChannelContentProps<FullAlbum>)} />
    );
  } else if (contentModel === TRACK_MODEL && layout === 'trackTable') {
    return <ChannelTrackTable {...(props as ChannelContentProps<Track>)} />;
  } else if (contentModel === CHANNEL_MODEL) {
    return <NestedChannels {...(props as ChannelContentProps<Channel>)} />;
  } else if (layout === 'carousel' || layout === 'compactGrid') {
    return (
      <ChannelContentCarousel
        layout={layout === 'compactGrid' ? 'compact' : undefined}
        {...props}
      />
    );
  } else {
    return <ChannelContentGrid {...props} />;
  }
}

function NestedChannels({channel}: ChannelContentProps) {
  return (
    <Fragment>
      <ChannelHeading channel={channel} />
      {channel.content?.data.map(nestedChannel => (
        <div key={nestedChannel.id} className="mb-50">
          <ChannelContent
            channel={nestedChannel as Channel<Channel>}
            isNested
          />
        </div>
      ))}
    </Fragment>
  );
}
