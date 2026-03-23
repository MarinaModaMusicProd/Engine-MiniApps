import {appQueries} from '@app/app-queries';
import {FullAlbum} from '@app/web-player/albums/album';
import {AlbumGridItem} from '@app/web-player/albums/album-grid-item';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {ArtistPageSubtitle} from '@app/web-player/artists/artist-page/artist-page-subtitle';
import {GetArtistResponse} from '@app/web-player/artists/requests/get-artist-response';
import {
  ContentCarouselControls,
  useContentCarouselControls,
} from '@app/web-player/channels/channel-content-carousel';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Button} from '@ui/buttons/button';
import {Trans} from '@ui/i18n/trans';
import {useRef} from 'react';
import {Link} from 'react-router';

type GroupedAlbums = NonNullable<GetArtistResponse['grouped_albums']>;

type DiscographyGroupedAlbumsProps = {
  groupedAlbums: GroupedAlbums;
};
export function DiscographyGroupedAlbums({
  groupedAlbums,
}: DiscographyGroupedAlbumsProps) {
  return (
    <div>
      {Object.entries(groupedAlbums).map(([albumType, albums]) => (
        <AlbumsCarousel
          key={albumType}
          albums={albums}
          albumType={albumType as keyof GroupedAlbums}
        />
      ))}
    </div>
  );
}

type AlbumsCarouselProps = {
  albums: {data: FullAlbum[]; hasMore: boolean};
  albumType: keyof GroupedAlbums;
};
function AlbumsCarousel({albums, albumType}: AlbumsCarouselProps) {
  const {artistId} = useRequiredParams(['artistId']);
  const artistQuery = useSuspenseQuery(
    appQueries.artists.show(artistId).artist('artistPage'),
  );
  const controls = useContentCarouselControls();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mb-44" ref={containerRef}>
      <div className="mb-10 flex items-center">
        <ArtistPageSubtitle margin="m-0">
          <AlbumTypeDisplayName albumType={albumType} />
        </ArtistPageSubtitle>
        <ContentCarouselControls {...controls} className="ml-auto" />
        {albums.hasMore ? (
          <Button
            size="xs"
            variant="outline"
            className="ml-8"
            elementType={Link}
            to={`${getArtistLink(artistQuery.data.artist, {absolute: true})}/albums?recordType=${albumType}`}
          >
            <Trans message="View all" />
          </Button>
        ) : null}
      </div>

      <ContentGrid
        isCarousel
        contentModel="album"
        containerRef={controls.containerRefCallback}
      >
        {albums.data.map(item => (
          <AlbumGridItem key={item.id} album={item} />
        ))}
      </ContentGrid>
    </div>
  );
}

type AlbumTypeDisplayNameProps = {
  albumType: keyof GroupedAlbums;
};
function AlbumTypeDisplayName({albumType}: AlbumTypeDisplayNameProps) {
  switch (albumType) {
    case 'album':
      return <Trans message="Albums" />;
    case 'single':
      return <Trans message="Singles" />;
    case 'ep':
      return <Trans message="EPs" />;
    case 'compilation':
      return <Trans message="Compilations" />;
  }
}
