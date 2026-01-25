import {appQueries} from '@app/app-queries';
import {AlbumGridItem} from '@app/web-player/albums/album-grid-item';
import {MediaPageNoResultsMessage} from '@app/web-player/layout/media-page-no-results-message';
import {PlayerPageSuspense} from '@app/web-player/layout/player-page-suspsense';
import {usePlayerPagePaginationParams} from '@app/web-player/layout/use-player-page-pagination-params';
import {LibraryPageSortDropdown} from '@app/web-player/library/library-page-sort-dropdown';
import {defaultLibrarySortDescriptor} from '@app/web-player/library/library-search-params';
import {useLibraryStore} from '@app/web-player/library/state/likes-store';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {AdHost} from '@common/admin/ads/ad-host';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {TextField} from '@ui/forms/input-field/text-field/text-field';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {SearchIcon} from '@ui/icons/material/Search';
import {ProgressCircle} from '@ui/progress/progress-circle';

const sortItems = {
  'likes.created_at:desc': message('Recently added'),
  'name:asc': message('A-Z'),
  'release_date:desc': message('Release date'),
};

export function Component() {
  return (
    <PlayerPageSuspense>
      <LibraryAlbumsPage />
    </PlayerPageSuspense>
  );
}

function LibraryAlbumsPage() {
  const {trans} = useTrans();
  const totalItems = useLibraryStore(s => Object.keys(s.album).length);

  const {
    searchQuery,
    setSearchQuery,
    sortDescriptor,
    setSortDescriptor,
    isDefferedLoading,
    queryParams,
  } = usePlayerPagePaginationParams(defaultLibrarySortDescriptor);

  const query = useSuspenseInfiniteQuery(
    appQueries.albums.liked('me', queryParams),
  );
  const albums = useFlatInfiniteQueryItems(query);

  return (
    <div>
      <StaticPageTitle>
        <Trans message="Your albums" />
      </StaticPageTitle>
      <AdHost slot="general_top" className="mb-34" />
      <h1 className="mb-20 text-2xl font-semibold">
        {totalItems ? (
          <Trans
            message="[one 1 liked album|other :count liked albums]"
            values={{count: totalItems}}
          />
        ) : (
          <Trans message="My albums" />
        )}
      </h1>
      <div className="flex items-center justify-between gap-24">
        <TextField
          onChange={e => setSearchQuery(e.target.value)}
          className="max-w-512 flex-auto"
          size="sm"
          startAdornment={<SearchIcon />}
          placeholder={trans(message('Search within albums'))}
          endAdornment={
            isDefferedLoading ? (
              <ProgressCircle size="xs" isIndeterminate />
            ) : null
          }
        />
        <LibraryPageSortDropdown
          items={sortItems}
          sortDescriptor={sortDescriptor}
          setSortDescriptor={setSortDescriptor}
        />
      </div>
      <div className="mt-34">
        <ContentGrid>
          {albums.map(album => (
            <AlbumGridItem key={album.id} album={album} />
          ))}
          <InfiniteScrollSentinel query={query} />
        </ContentGrid>
      </div>
      {!albums.length ? (
        <MediaPageNoResultsMessage
          className="mt-34"
          searchQuery={searchQuery}
          description={
            <Trans message="You have not added any albums to your library yet." />
          }
        />
      ) : null}
      <AdHost slot="general_bottom" className="mt-34" />
    </div>
  );
}
