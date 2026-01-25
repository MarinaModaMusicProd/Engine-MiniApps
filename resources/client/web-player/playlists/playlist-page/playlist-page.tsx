import {appQueries} from '@app/app-queries';
import {MediaPageNoResultsMessage} from '@app/web-player/layout/media-page-no-results-message';
import {PlayerPageHeaderGradient} from '@app/web-player/layout/player-page-header-gradient';
import {PlayerPageSuspense} from '@app/web-player/layout/player-page-suspsense';
import {usePlayerPagePaginationParams} from '@app/web-player/layout/use-player-page-pagination-params';
import {PlaylistPageHeader} from '@app/web-player/playlists/playlist-page/playlist-page-header';
import {PlaylistPageOfflineFallback} from '@app/web-player/playlists/playlist-page/playlist-page-offline-fallback';
import {PlaylistTableRow} from '@app/web-player/playlists/playlist-page/playlist-table-row';
import {VirtualTableBody} from '@app/web-player/playlists/virtual-table-body';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {TrackTable} from '@app/web-player/tracks/track-table/track-table';
import {AdHost} from '@common/admin/ads/ad-host';
import {PageMetaTags} from '@common/http/page-meta-tags';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {SortDescriptor} from '@common/ui/tables/types/sort-descriptor';
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {TextField} from '@ui/forms/input-field/text-field/text-field';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {SearchIcon} from '@ui/icons/material/Search';
import {ProgressCircle} from '@ui/progress/progress-circle';
import {useRef} from 'react';

const defaultTracksSortDescriptor = {
  orderBy: 'position',
  orderDir: 'asc',
} satisfies SortDescriptor;

export function Component() {
  return (
    <PlayerPageSuspense offlineFallback={<PlaylistPageOfflineFallback />}>
      <PlaylistPage />
    </PlayerPageSuspense>
  );
}

function PlaylistPage() {
  const {trans} = useTrans();
  const {playlistId} = useRequiredParams(['playlistId']);
  const playlistQuery = useSuspenseQuery(
    appQueries.playlists.show(playlistId).playlist('playlistPage'),
  );
  const playlist = playlistQuery.data.playlist;

  const {
    searchQuery,
    setSearchQuery,
    sortDescriptor,
    setSortDescriptor,
    isDefferedLoading,
    queryParams,
  } = usePlayerPagePaginationParams(defaultTracksSortDescriptor);
  const initialQueryParams = useRef(queryParams).current;

  const initialData =
    initialQueryParams.query === queryParams.query &&
    initialQueryParams.orderBy === queryParams.orderBy &&
    initialQueryParams.orderDir === queryParams.orderDir
      ? playlistQuery.data.tracks
      : undefined;

  const tracksQuery = useSuspenseInfiniteQuery(
    appQueries.playlists.show(playlistId).tracks(queryParams, initialData),
  );
  const tracks = useFlatInfiniteQueryItems(tracksQuery);

  const totalItems = playlist.tracks_count || 0;
  const queueId = queueGroupId(
    playlistQuery.data.playlist,
    '*',
    sortDescriptor,
  );

  return (
    <>
      <PageMetaTags query={playlistQuery} />
      {playlist.image && <PlayerPageHeaderGradient image={playlist.image} />}
      <div className="relative">
        <AdHost slot="general_top" className="mb-44" />
        <PlaylistPageHeader
          playlist={playlist}
          totalDuration={playlistQuery.data.totalDuration}
          queueId={queueId}
        />
        <TextField
          onChange={e => setSearchQuery(e.target.value)}
          className="mb-44 max-w-512 md:mb-24"
          size="sm"
          startAdornment={<SearchIcon />}
          placeholder={trans(message('Search within playlist'))}
          endAdornment={
            isDefferedLoading ? (
              <ProgressCircle size="xs" isIndeterminate />
            ) : null
          }
        />
        <TrackTable
          queueGroupId={queueId}
          tracks={tracks}
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
          renderRowAs={PlaylistTableRow}
          playlist={playlist}
          tableBody={
            <VirtualTableBody query={tracksQuery} totalItems={totalItems} />
          }
        />
        {!tracks.length ? (
          <MediaPageNoResultsMessage
            className="mt-34"
            searchQuery={searchQuery}
            description={
              <Trans message="This playlist does not have any tracks yet" />
            }
          />
        ) : null}
        <AdHost slot="general_bottom" className="mt-44" />
      </div>
    </>
  );
}
