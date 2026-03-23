import { appQueries } from '@app/app-queries';
import { MediaPageNoResultsMessage } from '@app/web-player/layout/media-page-no-results-message';
import { PlayerPageSuspense } from '@app/web-player/layout/player-page-suspsense';
import { usePlayerPagePaginationParams } from '@app/web-player/layout/use-player-page-pagination-params';
import { LibraryPageSortDropdown } from '@app/web-player/library/library-page-sort-dropdown';
import { ContentGrid } from '@app/web-player/playable-item/content-grid';
import { CreatePlaylistDialog } from '@app/web-player/playlists/crupdate-dialog/create-playlist-dialog';
import { PlaylistGridItem } from '@app/web-player/playlists/playlist-grid-item';
import { getPlaylistLink } from '@app/web-player/playlists/playlist-link';
import { useAuthClickCapture } from '@app/web-player/use-auth-click-capture';
import { AdHost } from '@common/admin/ads/ad-host';
import { StaticPageTitle } from '@common/seo/static-page-title';
import { InfiniteScrollSentinel } from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import { useFlatInfiniteQueryItems } from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import { useNavigate } from '@common/ui/navigation/use-navigate';
import { SortDescriptor } from '@common/ui/tables/types/sort-descriptor';
import { useQuery, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { IconButton } from '@ui/buttons/icon-button';
import { TextField } from '@ui/forms/input-field/text-field/text-field';
import { message } from '@ui/i18n/message';
import { Trans } from '@ui/i18n/trans';
import { useTrans } from '@ui/i18n/use-trans';
import { PlaylistAddIcon } from '@ui/icons/material/PlaylistAdd';
import { SearchIcon } from '@ui/icons/material/Search';
import { DialogTrigger } from '@ui/overlays/dialog/dialog-trigger';
import { ProgressCircle } from '@ui/progress/progress-circle';

const sortItems = {
  'updated_at:desc': message('Recently updated'),
  'name:asc': message('A-Z'),
  'views:desc': message('Most viewed'),
  'plays:desc': message('Most played'),
};

const defaultSortDescriptor = {
  orderBy: 'updated_at',
  orderDir: 'desc',
} satisfies SortDescriptor;

export function Component() {
  return (
    <PlayerPageSuspense>
      <LibraryPlaylistsPage />
    </PlayerPageSuspense>
  );
}

function LibraryPlaylistsPage() {
  const navigate = useNavigate();
  const authHandler = useAuthClickCapture();
  const {trans} = useTrans();
  const {data} = useQuery(appQueries.playlists.compactAuthUserPlaylists());
  const totalItems = data.length;

  const {
    searchQuery,
    setSearchQuery,
    sortDescriptor,
    setSortDescriptor,
    isDefferedLoading,
    queryParams,
  } = usePlayerPagePaginationParams(defaultSortDescriptor);

  const query = useSuspenseInfiniteQuery(
    appQueries.playlists.userPlaylists('me', queryParams),
  );
  const playlists = useFlatInfiniteQueryItems(query);

  return (
    <div>
      <StaticPageTitle>
        <Trans message="Your playlists" />
      </StaticPageTitle>
      <AdHost slot="general_top" className="mb-34" />
      <div className="mb-20 flex items-center justify-between gap-24">
        <h1 className="whitespace-nowrap text-2xl font-semibold">
          {totalItems ? (
            <Trans
              message="[one 1 playlist|other :count playlists]"
              values={{count: totalItems}}
            />
          ) : (
            <Trans message="My playlists" />
          )}
        </h1>
        <DialogTrigger
          type="modal"
          onClose={newPlaylist => {
            if (newPlaylist) {
              navigate(getPlaylistLink(newPlaylist));
            }
          }}
        >
          <IconButton className="flex-shrink-0" onClickCapture={authHandler}>
            <PlaylistAddIcon />
          </IconButton>
          <CreatePlaylistDialog />
        </DialogTrigger>
      </div>

      <div className="flex items-center justify-between gap-24">
        <TextField
          onChange={e => setSearchQuery(e.target.value)}
          className="max-w-512 flex-auto"
          size="sm"
          startAdornment={<SearchIcon />}
          placeholder={trans(message('Search within playlists'))}
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
          {playlists.map(playlist => (
            <PlaylistGridItem key={playlist.id} playlist={playlist} />
          ))}
          <InfiniteScrollSentinel query={query} />
        </ContentGrid>
      </div>
      {!playlists.length ? (
        <MediaPageNoResultsMessage
          className="mt-34"
          searchQuery={searchQuery}
          description={
            <Trans message="You have not added any playlists to your library yet." />
          }
        />
      ) : null}
    </div>
  );
}
