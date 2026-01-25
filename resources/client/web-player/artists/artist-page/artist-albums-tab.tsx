import {appQueries} from '@app/app-queries';
import {AlbumList} from '@app/web-player/albums/album-list/album-list';
import {GetArtistResponse} from '@app/web-player/artists/requests/get-artist-response';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {AlbumIcon} from '@ui/icons/material/Album';
import {IllustratedMessage} from '@ui/images/illustrated-message';

interface Props {
  data: GetArtistResponse;
}
export function ArtistAlbumsTab({data}: Props) {
  const query = useSuspenseInfiniteQuery(
    appQueries.artists.show(data.artist.id).albums('list', data.albums),
  );
  const albums = useFlatInfiniteQueryItems(query);

  if (!albums.length) {
    return (
      <IllustratedMessage
        imageHeight="h-auto"
        imageMargin="mb-14"
        image={<AlbumIcon size="lg" className="text-muted" />}
        title={<Trans message="No albums yet" />}
        description={
          <Trans
            message="Follow :artist for updates on their latest releases."
            values={{artist: data.artist.name}}
          />
        }
      />
    );
  }

  return <AlbumList albums={albums} query={query} />;
}
