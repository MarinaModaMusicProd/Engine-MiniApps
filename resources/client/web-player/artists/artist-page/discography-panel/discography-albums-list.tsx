import {appQueries} from '@app/app-queries';
import {FullAlbum} from '@app/web-player/albums/album';
import {AlbumContextDialog} from '@app/web-player/albums/album-context-dialog';
import {AlbumImage} from '@app/web-player/albums/album-image/album-image';
import {AlbumLink} from '@app/web-player/albums/album-link';
import {FullArtist} from '@app/web-player/artists/artist';
import {NoDiscographyMessage} from '@app/web-player/artists/artist-page/discography-panel/no-discography-message';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {TrackTable} from '@app/web-player/tracks/track-table/track-table';
import {PaginationResponse} from '@common/http/backend-response/pagination-response';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useSortableTableData} from '@common/ui/tables/use-sortable-table-data';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {Button} from '@ui/buttons/button';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {Trans} from '@ui/i18n/trans';
import {ArrowDropDownIcon} from '@ui/icons/material/ArrowDropDown';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';

interface Props {
  artist: FullArtist;
  initialAlbums: PaginationResponse<FullAlbum> | null;
}
export function DiscographyAlbumsList({artist, initialAlbums}: Props) {
  const query = useSuspenseInfiniteQuery(
    appQueries.artists.show(artist.id).albums('list', initialAlbums),
  );
  const albums = useFlatInfiniteQueryItems(query);

  if (!albums.length) {
    return <NoDiscographyMessage />;
  }

  return (
    <section>
      {albums.map(album => (
        <div key={album.id} className="mb-40">
          <div className="mb-20 flex items-center gap-14">
            <AlbumImage
              album={album}
              size="w-110 h-110"
              className="flex-shrink-0 rounded object-cover"
            />
            <div className="min-w-0 flex-auto">
              <h4 className="min-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap text-lg font-semibold max-md:mt-12">
                <AlbumLink album={album} />
              </h4>
              {album.release_date && (
                <div className="mb-18 mt-2 text-sm text-muted">
                  <FormattedDate date={album.release_date} />
                </div>
              )}
              <DialogTrigger type="popover" mobileType="tray" offset={10}>
                <Button
                  variant="outline"
                  size="xs"
                  radius="rounded-full"
                  endIcon={<ArrowDropDownIcon />}
                >
                  <Trans message="More" />
                </Button>
                <AlbumContextDialog album={album} />
              </DialogTrigger>
            </div>
          </div>
          <AlbumTrackTable album={album} />
        </div>
      ))}
      <InfiniteScrollSentinel query={query} />
    </section>
  );
}

interface AlbumTrackTableProps {
  album: FullAlbum;
}
function AlbumTrackTable({album}: AlbumTrackTableProps) {
  const {data, sortDescriptor, onSortChange} = useSortableTableData(
    album.tracks,
  );
  return (
    <TrackTable
      tracks={data}
      hideAlbum
      hideTrackImage
      sortDescriptor={sortDescriptor}
      onSortChange={onSortChange}
      queueGroupId={queueGroupId(album, '*', sortDescriptor)}
    />
  );
}
