import {appQueries} from '@app/app-queries';
import {MediaPageNoResultsMessage} from '@app/web-player/layout/media-page-no-results-message';
import {PlayerPageSuspense} from '@app/web-player/layout/player-page-suspsense';
import {usePlayerPagePaginationParams} from '@app/web-player/layout/use-player-page-pagination-params';
import {PlaybackToggleButton} from '@app/web-player/playable-item/playback-toggle-button';
import {VirtualTableBody} from '@app/web-player/playlists/virtual-table-body';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {LibraryPageTrack} from '@app/web-player/tracks/track';
import {TrackTable} from '@app/web-player/tracks/track-table/track-table';
import {AdHost} from '@common/admin/ads/ad-host';
import {useAuth} from '@common/auth/use-auth';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {SortDescriptor} from '@common/ui/tables/types/sort-descriptor';
import {TableDataItem} from '@common/ui/tables/types/table-data-item';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {TextField} from '@ui/forms/input-field/text-field/text-field';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {SearchIcon} from '@ui/icons/material/Search';
import {ProgressCircle} from '@ui/progress/progress-circle';
import {useCallback} from 'react';

const defaultSortDescriptor = {
  orderBy: 'track_plays.created_at',
  orderDir: 'desc',
} satisfies SortDescriptor;

export function Component() {
  return (
    <PlayerPageSuspense>
      <LibraryHistoryPage />
    </PlayerPageSuspense>
  );
}

function LibraryHistoryPage() {
  const {user} = useAuth();

  const {searchQuery, setSearchQuery, isDefferedLoading, queryParams} =
    usePlayerPagePaginationParams(defaultSortDescriptor);

  const query = useSuspenseInfiniteQuery(
    appQueries.userProfile(user!.id).playHistory(queryParams),
  );
  const tracks = useFlatInfiniteQueryItems(query);

  const {trans} = useTrans();
  const queueId = queueGroupId(user!, 'playHistory');

  // same track can appear in history multiple times, generate unique key based on listen time
  const rowKeyGenerator = useCallback((item: TableDataItem) => {
    return `${item.id}-${(item as LibraryPageTrack).added_at}`;
  }, []);

  return (
    <div>
      <StaticPageTitle>
        <Trans message="Listening history" />
      </StaticPageTitle>
      <AdHost slot="general_top" className="mb-34" />
      <div className="mb-34 flex flex-wrap items-center justify-between gap-24">
        <h1 className="w-max whitespace-nowrap text-2xl font-semibold md:w-full">
          <Trans message="Listening history" />
        </h1>
        <PlaybackToggleButton
          queueId={queueId}
          buttonType="text"
          className="min-w-128 flex-shrink-0"
        />
        <TextField
          onChange={e => setSearchQuery(e.target.value)}
          className="max-w-512 flex-auto"
          size="sm"
          startAdornment={<SearchIcon />}
          placeholder={trans(message('Search within history'))}
          endAdornment={
            isDefferedLoading ? (
              <ProgressCircle size="xs" isIndeterminate />
            ) : null
          }
        />
      </div>
      <TrackTable
        enableSorting={false}
        queueGroupId={queueId}
        tracks={tracks}
        hideAddedAtColumn={false}
        tableBody={
          <VirtualTableBody query={query} rowKeyGenerator={rowKeyGenerator} />
        }
      />
      {!tracks.length ? (
        <MediaPageNoResultsMessage
          className="mt-34"
          searchQuery={searchQuery}
          description={<Trans message="You have not played any songs yet." />}
        />
      ) : null}
      <AdHost slot="general_bottom" className="mt-34" />
    </div>
  );
}
