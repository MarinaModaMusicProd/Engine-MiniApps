import {ChannelContentModel} from '@app/admin/channels/channel-content-config';
import {ChannelContentProps} from '@app/web-player/channels/channel-content';
import {ChannelContentGridItem} from '@app/web-player/channels/channel-content-grid-item';
import {ChannelHeading} from '@app/web-player/channels/channel-heading';
import {ContentGridItemLayout} from '@app/web-player/channels/content-grid-item-layout';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {useChannelContent} from '@common/channels/requests/use-channel-content';
import {useInfiniteChannelContent} from '@common/channels/requests/use-infinite-channel-content';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {
  PaginationControls,
  PaginationControlsType,
} from '@common/ui/navigation/pagination-controls';
import {Fragment} from 'react';

type ChannelContentGridProps = ChannelContentProps & {
  layout?: ContentGridItemLayout;
  isCarousel?: boolean;
};

export function ChannelContentGrid(props: ChannelContentGridProps) {
  const isInfiniteScroll =
    !props.isNested &&
    (!props.channel.config.paginationType ||
      props.channel.config.paginationType === 'infiniteScroll');
  return (
    <Fragment>
      <ChannelHeading {...props} />
      {isInfiniteScroll ? (
        <InfiniteScrollGrid {...props} />
      ) : (
        <PaginatedGrid isCarousel={props.isCarousel} {...props} />
      )}
    </Fragment>
  );
}

function PaginatedGrid({
  channel,
  isNested,
  layout,
  isCarousel,
}: ChannelContentGridProps) {
  const shouldPaginate = !isNested;
  const {query} = useChannelContent<ChannelContentModel>(
    channel,
    'channelPage',
  );
  const content = query.data?.channel?.content;

  return (
    <div>
      {shouldPaginate && (
        <PaginationControls
          pagination={content}
          type={channel.config.paginationType as PaginationControlsType}
          className="mb-24"
        />
      )}
      <ContentGrid
        layout={layout}
        isCarousel={isCarousel}
        contentModel={channel.config.contentModel}
      >
        {content?.data.map(item => (
          <ChannelContentGridItem
            key={`${item.id}-${item.model_type}`}
            layout={layout}
            item={item}
            items={content?.data}
          />
        ))}
      </ContentGrid>
      {shouldPaginate && (
        <PaginationControls
          pagination={content}
          type={channel.config.paginationType as PaginationControlsType}
          className="mt-24"
          scrollToTop
        />
      )}
    </div>
  );
}

function InfiniteScrollGrid({channel, layout}: ChannelContentGridProps) {
  const {query, items} =
    useInfiniteChannelContent<ChannelContentModel>(channel);

  return (
    <div>
      <ContentGrid layout={layout} contentModel={channel.config.contentModel}>
        {items.map(item => (
          <ChannelContentGridItem
            key={`${item.id}-${item.model_type}`}
            layout={layout}
            item={item}
            items={items}
          />
        ))}
      </ContentGrid>
      <InfiniteScrollSentinel query={query} />
    </div>
  );
}
