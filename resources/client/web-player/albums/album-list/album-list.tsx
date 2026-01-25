import {FullAlbum} from '@app/web-player/albums/album';
import {AlbumGridItem} from '@app/web-player/albums/album-grid-item';
import {AlbumListItem} from '@app/web-player/albums/album-list/album-list-item';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {
  UseInfiniteQueryResult,
  UseSuspenseInfiniteQueryResult,
} from '@tanstack/react-query';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';

interface Props {
  albums: FullAlbum[];
  query?: UseSuspenseInfiniteQueryResult | UseInfiniteQueryResult;
}
export function AlbumList({albums, query}: Props) {
  const isMobile = useIsMobileMediaQuery();

  if (isMobile) {
    return (
      <div>
        <ContentGrid>
          {albums.map(album => (
            <AlbumGridItem album={album} key={album.id} />
          ))}
        </ContentGrid>
        {query && <InfiniteScrollSentinel query={query} />}
      </div>
    );
  }

  return (
    <div>
      {albums.map(album => (
        <AlbumListItem key={album.id} album={album} className="mb-40" />
      ))}
      {query && <InfiniteScrollSentinel query={query} />}
    </div>
  );
}
