import {ChannelContentProps} from '@app/web-player/channels/channel-content';
import {ChannelContentGridItem} from '@app/web-player/channels/channel-content-grid-item';
import {ChannelHeading} from '@app/web-player/channels/channel-heading';
import {ContentGridItemLayout} from '@app/web-player/channels/content-grid-item-layout';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {IconButton} from '@ui/buttons/icon-button';
import {KeyboardArrowLeftIcon} from '@ui/icons/material/KeyboardArrowLeft';
import {KeyboardArrowRightIcon} from '@ui/icons/material/KeyboardArrowRight';
import debounce from 'just-debounce-it';
import {useCallback, useEffect, useRef, useState} from 'react';

type Props = ChannelContentProps & {
  layout?: ContentGridItemLayout;
};

export function ChannelContentCarousel(props: Props) {
  const {channel, layout} = props;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemWidth = useRef<number>(0);

  const [enablePrev, setEnablePrev] = useState(false);
  const [enableNext, setEnableNext] = useState(true);

  const updateNavStatus = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el && itemWidth.current) {
      setEnablePrev(el.scrollLeft > 0);
      setEnableNext(el.scrollWidth - el.scrollLeft !== el.clientWidth);
    }
  }, []);

  // enable/disable navigation buttons based on element scroll offset
  useEffect(() => {
    const el = scrollContainerRef.current;
    const handleScroll = debounce(() => updateNavStatus(), 100);
    if (el) {
      el.addEventListener('scroll', handleScroll);
    }
    return () => el?.removeEventListener('scroll', handleScroll);
  }, [updateNavStatus]);

  const scrollAmount = () => {
    return itemWidth.current * 2;
  };

  return (
    <div>
      <div className="mb-14 flex items-center justify-between gap-24">
        <ChannelHeading {...props} margin="mb-4" />
        <div>
          <IconButton
            disabled={!enablePrev}
            onClick={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollBy({left: -scrollAmount()});
              }
            }}
          >
            <KeyboardArrowLeftIcon />
          </IconButton>
          <IconButton
            disabled={!enableNext}
            onClick={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollBy({left: scrollAmount()});
              }
            }}
          >
            <KeyboardArrowRightIcon />
          </IconButton>
        </div>
      </div>

      <ContentGrid
        layout={layout}
        isCarousel
        contentModel={channel.config.contentModel}
        containerRef={el => {
          if (el) {
            scrollContainerRef.current = el;
            const firstGridItem = el.children.item(0);
            const observer = new ResizeObserver(entries => {
              itemWidth.current = entries[0].contentRect.width;
              updateNavStatus();
            });
            if (firstGridItem) {
              observer.observe(firstGridItem);
            }
            return () => {
              scrollContainerRef.current = null;
              return observer.unobserve(el);
            };
          }
        }}
      >
        {channel.content?.data.map(item => (
          <ChannelContentGridItem
            key={`${item.id}-${item.model_type}`}
            layout={layout}
            item={item}
            items={channel.content?.data}
          />
        ))}
      </ContentGrid>
    </div>
  );
}
