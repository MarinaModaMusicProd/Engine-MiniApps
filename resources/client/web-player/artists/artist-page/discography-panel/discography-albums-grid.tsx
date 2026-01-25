import {appQueries} from '@app/app-queries';
import {FullAlbum} from '@app/web-player/albums/album';
import {AlbumGridItem} from '@app/web-player/albums/album-grid-item';
import {FullArtist} from '@app/web-player/artists/artist';
import {NoDiscographyMessage} from '@app/web-player/artists/artist-page/discography-panel/no-discography-message';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {PaginationResponse} from '@common/http/backend-response/pagination-response';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';

interface Props {
  artist: FullArtist;
  initialAlbums: PaginationResponse<FullAlbum> | null;
}
export function DiscographyAlbumsGrid({artist, initialAlbums}: Props) {
  const query = useSuspenseInfiniteQuery(
    appQueries.artists.show(artist.id).albums('grid', initialAlbums),
  );
  const albums = useFlatInfiniteQueryItems(query);

  if (!albums.length) {
    return <NoDiscographyMessage />;
  }

  return (
    <ContentGrid>
      {albums.map(album => (
        <AlbumGridItem key={album.id} album={album} />
      ))}
      <InfiniteScrollSentinel query={query} />
    </ContentGrid>
  );
}
