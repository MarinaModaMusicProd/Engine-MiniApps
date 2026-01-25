import {ContentGridItemLayout} from '@app/web-player/channels/content-grid-item-layout';
import {GENRE_MODEL} from '@app/web-player/genres/genre';
import clsx from 'clsx';
import {ReactNode, Ref} from 'react';

interface Props {
  className?: string;
  children: ReactNode;
  layout?: ContentGridItemLayout;
  isCarousel?: boolean;
  contentModel?: string;
  containerRef?: Ref<HTMLDivElement | null>;
}
export function ContentGrid({
  children,
  layout,
  className,
  containerRef,
  isCarousel,
  contentModel,
}: Props) {
  return (
    <div
      ref={containerRef}
      className={clsx(
        'content-grid',
        layout === 'compact'
          ? contentModel === GENRE_MODEL
            ? 'compact-genre-grid'
            : 'compact-grid'
          : contentModel === GENRE_MODEL
            ? 'default-genre-grid'
            : 'default-grid',
        isCarousel && 'carousel-grid',
        className,
      )}
    >
      {children}
    </div>
  );
}
