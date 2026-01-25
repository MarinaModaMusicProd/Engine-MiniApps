import {FullAlbum} from '@app/web-player/albums/album';
import {AlbumList} from '@app/web-player/albums/album-list/album-list';
import {ChannelContentProps} from '@app/web-player/channels/channel-content';
import {ChannelHeading} from '@app/web-player/channels/channel-heading';
import {Track, TRACK_MODEL} from '@app/web-player/tracks/track';
import {TrackList} from '@app/web-player/tracks/track-list/track-list';
import {ChannelContentItem} from '@common/channels/channel';
import {useChannelContent} from '@common/channels/requests/use-channel-content';
import {useInfiniteChannelContent} from '@common/channels/requests/use-infinite-channel-content';
import {
  PaginationControls,
  PaginationControlsType,
} from '@common/ui/navigation/pagination-controls';
import {Fragment} from 'react';

type ContentItem = ChannelContentItem<Track> | ChannelContentItem<FullAlbum>;
type ContentProps = ChannelContentProps<ContentItem>;

export function ChannelContentList(props: ContentProps) {
  const isInfiniteScroll =
    !props.isNested &&
    (!props.channel.config.paginationType ||
      props.channel.config.paginationType === 'infiniteScroll');
  return (
    <Fragment>
      <ChannelHeading {...props} />
      {isInfiniteScroll ? (
        <InfiniteScrollList {...props} />
      ) : (
        <PaginatedTrackList {...props} />
      )}
    </Fragment>
  );
}

function InfiniteScrollList({channel}: ContentProps) {
  const {query, items} = useInfiniteChannelContent<ContentItem>(channel);
  const totalItems =
    channel.content && 'total' in channel.content
      ? channel.content.total
      : undefined;

  if (channel.config.contentModel === TRACK_MODEL) {
    return (
      <TrackList
        query={query}
        tracks={items as Track[]}
        totalTracks={totalItems}
      />
    );
  }

  return <AlbumList query={query} albums={items as FullAlbum[]} />;
}

function PaginatedTrackList({channel, isNested}: ContentProps) {
  const shouldPaginate = !isNested;
  const {query} = useChannelContent<ContentItem>(channel, 'channelPage');
  const pagination = query.data?.channel?.content;

  const items = pagination?.data || [];

  const list =
    channel.config.contentModel === TRACK_MODEL ? (
      <TrackList tracks={items as Track[]} totalTracks={items.length} />
    ) : (
      <AlbumList albums={items as FullAlbum[]} />
    );

  return (
    <div>
      {shouldPaginate && (
        <PaginationControls
          pagination={pagination}
          type={channel.config.paginationType as PaginationControlsType}
          className="mb-24"
        />
      )}
      {list}
      {shouldPaginate && (
        <PaginationControls
          pagination={pagination}
          type={channel.config.paginationType as PaginationControlsType}
          className="mt-24"
          scrollToTop
        />
      )}
    </div>
  );
}
