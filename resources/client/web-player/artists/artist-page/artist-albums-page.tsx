import {appQueries} from '@app/app-queries';
import {RecordType} from '@app/web-player/albums/album';
import {AlbumGridItem} from '@app/web-player/albums/album-grid-item';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {artistAlbumsResponseType} from '@app/web-player/artists/requests/get-artist-response';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {Breadcrumb} from '@ui/breadcrumbs/breadcrumb';
import {BreadcrumbItem} from '@ui/breadcrumbs/breadcrumb-item';
import {Trans} from '@ui/i18n/trans';
import {useSearchParams} from 'react-router';

export function Component() {
  const {artistId} = useRequiredParams(['artistId']);
  const [searchParams] = useSearchParams();
  const recordType = searchParams.get('recordType') ?? undefined;
  const query = useSuspenseInfiniteQuery(
    appQueries.artists
      .show(artistId)
      .albums(artistAlbumsResponseType.GRID, recordType),
  );

  const items = useFlatInfiniteQueryItems(query);

  const artist = query.data.pages[0].artist;

  const recordTypeTitle = <RecordTypeTitle recordType={recordType} />;

  return (
    <div>
      <h1 className="mb-14">
        {artist ? (
          <Breadcrumb size="xl" className="font-semibold">
            <BreadcrumbItem to={getArtistLink(artist, {absolute: true})}>
              {artist.name}
            </BreadcrumbItem>
            <BreadcrumbItem>{recordTypeTitle}</BreadcrumbItem>
          </Breadcrumb>
        ) : (
          <span className="text-3xl font-bold">{recordTypeTitle}</span>
        )}
      </h1>

      <ContentGrid contentModel="album">
        {items.map(item => (
          <AlbumGridItem key={item.id} album={item} />
        ))}
      </ContentGrid>
      <InfiniteScrollSentinel query={query} />
    </div>
  );
}

type RecordTypeTitleProps = {
  recordType: RecordType | string | undefined;
};
function RecordTypeTitle({recordType}: RecordTypeTitleProps) {
  switch (recordType) {
    case 'album':
      return <Trans message="albums" />;
    case 'single':
      return <Trans message="singles" />;
    case 'ep':
      return <Trans message="eps" />;
    case 'compilation':
      return <Trans message="compilations" />;
    default:
      return <Trans message="releases" />;
  }
}
