import {appQueries} from '@app/app-queries';
import {MediaPageNoResultsMessage} from '@app/web-player/layout/media-page-no-results-message';
import {PlayerPageSuspense} from '@app/web-player/layout/player-page-suspsense';
import {usePlayerPagePaginationParams} from '@app/web-player/layout/use-player-page-pagination-params';
import {defaultLibrarySortDescriptor} from '@app/web-player/library/library-search-params';
import {useLibraryStore} from '@app/web-player/library/state/likes-store';
import {PlaybackToggleButton} from '@app/web-player/playable-item/playback-toggle-button';
import {VirtualTableBody} from '@app/web-player/playlists/virtual-table-body';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {TrackTable} from '@app/web-player/tracks/track-table/track-table';
import {AdHost} from '@common/admin/ads/ad-host';
import {useAuth} from '@common/auth/use-auth';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {TextField} from '@ui/forms/input-field/text-field/text-field';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {SearchIcon} from '@ui/icons/material/Search';
import {ProgressCircle} from '@ui/progress/progress-circle';

export function Component() {
  return (
    <PlayerPageSuspense>
      <LibraryTracksPage />
    </PlayerPageSuspense>
  );
}

function LibraryTracksPage() {
  const {user} = useAuth();
  const {trans} = useTrans();

  const {
    searchQuery,
    setSearchQuery,
    sortDescriptor,
    setSortDescriptor,
    isDefferedLoading,
    queryParams,
  } = usePlayerPagePaginationParams(defaultLibrarySortDescriptor);

  const query = useSuspenseInfiniteQuery(
    appQueries.tracks.liked('me', queryParams),
  );
  const tracks = useFlatInfiniteQueryItems(query);

  const queueId = queueGroupId(user!, 'libraryTracks', sortDescriptor);
  const trackCount = useLibraryStore(s => Object.keys(s.track).length);

  return (
    <div>
      <StaticPageTitle>
        <Trans message="Your tracks" />
      </StaticPageTitle>
      <AdHost slot="general_top" className="mb-34" />
      <div className="mb-34 flex flex-wrap items-center justify-between gap-24">
        <h1 className="w-max whitespace-nowrap text-2xl font-semibold md:w-full">
          {trackCount ? (
            <Trans
              message="[one 1 liked song|other :count liked songs]"
              values={{count: trackCount}}
            />
          ) : (
            <Trans message="My songs" />
          )}
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
          placeholder={trans(message('Search within tracks'))}
          endAdornment={
            isDefferedLoading ? (
              <ProgressCircle size="xs" isIndeterminate />
            ) : null
          }
        />
      </div>
      <TrackTable
        queueGroupId={queueId}
        tracks={tracks}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        hideAddedAtColumn={false}
        tableBody={<VirtualTableBody query={query} totalItems={trackCount} />}
      />
      {!tracks.length ? (
        <MediaPageNoResultsMessage
          className="mt-34"
          searchQuery={searchQuery}
          description={
            <Trans message="You have not added any songs to your library yet." />
          }
        />
      ) : null}
      <AdHost slot="general_bottom" className="mt-34" />
    </div>
  );
}
