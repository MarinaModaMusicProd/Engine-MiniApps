import {ChannelContentProps} from '@app/web-player/channels/channel-content';
import {ChannelHeading} from '@app/web-player/channels/channel-heading';
import {VirtualTableBody} from '@app/web-player/playlists/virtual-table-body';
import {Track} from '@app/web-player/tracks/track';
import {TrackTable} from '@app/web-player/tracks/track-table/track-table';
import {ChannelContentItem} from '@common/channels/channel';
import {useChannelContent} from '@common/channels/requests/use-channel-content';
import {useInfiniteChannelContent} from '@common/channels/requests/use-infinite-channel-content';
import {
  PaginationControls,
  PaginationControlsType,
} from '@common/ui/navigation/pagination-controls';
import {Fragment} from 'react';

export function ChannelTrackTable(
  props: ChannelContentProps<ChannelContentItem<Track>>,
) {
  const isInfiniteScroll =
    !props.isNested &&
    (!props.channel.config.paginationType ||
      props.channel.config.paginationType === 'infiniteScroll');
  return (
    <Fragment>
      <ChannelHeading {...props} />
      {isInfiniteScroll ? (
        <InfiniteScrollTable {...props} />
      ) : (
        <PaginatedTable {...props} />
      )}
    </Fragment>
  );
}

function PaginatedTable({channel, isNested}: ChannelContentProps<Track>) {
  const shouldPaginate = !isNested;
  const {query} = useChannelContent<ChannelContentItem<Track>>(
    channel,
    'channelPage',
  );
  const pagination = query.data?.channel?.content;

  return (
    <div>
      {shouldPaginate && (
        <PaginationControls
          pagination={pagination}
          type={channel.config.paginationType as PaginationControlsType}
          className="mb-24"
        />
      )}
      <TrackTable tracks={pagination?.data || []} enableSorting={false} />
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

function InfiniteScrollTable({channel}: ChannelContentProps<Track>) {
  const {query, items} =
    useInfiniteChannelContent<ChannelContentItem<Track>>(channel);

  const totalItems =
    channel.content && 'total' in channel.content
      ? channel.content.total
      : undefined;

  return (
    <TrackTable
      enableSorting={false}
      tracks={items}
      tableBody={<VirtualTableBody query={query} totalItems={totalItems} />}
    />
  );
}
