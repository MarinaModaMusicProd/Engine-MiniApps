import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {
  albumGridViewPerPage,
  albumListViewPerPage,
  AlbumsViewMode,
} from '@app/web-player/artists/artist-page/discography-panel/albums-view-mode';
import {DiscographyAlbumsGrid} from '@app/web-player/artists/artist-page/discography-panel/discography-albums-grid';
import {DiscographyAlbumsList} from '@app/web-player/artists/artist-page/discography-panel/discography-albums-list';
import {TopTracksTable} from '@app/web-player/artists/artist-page/discography-panel/top-tracks-table';
import {
  albumViewModeKey,
  GetArtistResponse,
} from '@app/web-player/artists/requests/get-artist-response';
import {AdHost} from '@common/admin/ads/ad-host';
import {useShowGlobalLoadingBar} from '@common/core/use-show-global-loading-bar';
import {IconButton} from '@ui/buttons/icon-button';
import {Trans} from '@ui/i18n/trans';
import {GridViewIcon} from '@ui/icons/material/GridView';
import {ViewAgendaIcon} from '@ui/icons/material/ViewAgenda';
import {useSettings} from '@ui/settings/use-settings';
import {Tooltip} from '@ui/tooltip/tooltip';
import {useCookie} from '@ui/utils/hooks/use-cookie';
import {useTransition} from 'react';
import {Link} from 'react-router';

interface DiscographyTabProps {
  data: GetArtistResponse;
}
export function DiscographyTab({data}: DiscographyTabProps) {
  const {selectedAlbumViewMode, albums, artist} = data;
  const [isPending, startTransition] = useTransition();
  const {player} = useSettings();
  const [viewMode, setViewModeCookie] = useCookie(
    albumViewModeKey,
    selectedAlbumViewMode || player?.default_artist_view || 'list',
  );
  const setViewMode = (viewMode: AlbumsViewMode) => {
    startTransition(() => setViewModeCookie(viewMode));
  };

  useShowGlobalLoadingBar({isLoading: isPending});

  return (
    <div>
      <Header data={data} />
      <AdHost slot="artist_bottom" className="mt-34" />
      <div className="mt-44">
        <div className="mb-30 flex items-center border-b pb-4 text-muted">
          <h2 className="mr-auto text-base">
            <Trans message="Albums" />
          </h2>
          <Tooltip label={<Trans message="List view" />}>
            <IconButton
              className="ml-24 flex-shrink-0"
              color={viewMode === 'list' ? 'primary' : undefined}
              onClick={() => setViewMode('list')}
            >
              <ViewAgendaIcon />
            </IconButton>
          </Tooltip>
          <Tooltip label={<Trans message="Grid view" />}>
            <IconButton
              className="flex-shrink-0"
              color={viewMode === 'grid' ? 'primary' : undefined}
              onClick={() => setViewMode('grid')}
            >
              <GridViewIcon />
            </IconButton>
          </Tooltip>
        </div>
        {viewMode === 'list' ? (
          <DiscographyAlbumsList
            artist={artist}
            initialAlbums={
              albums?.per_page === albumListViewPerPage ? albums : null
            }
          />
        ) : (
          <DiscographyAlbumsGrid
            artist={artist}
            initialAlbums={
              albums?.per_page === albumGridViewPerPage ? albums : null
            }
          />
        )}
      </div>
    </div>
  );
}

interface HeaderProps {
  data: GetArtistResponse;
}
function Header({data}: HeaderProps) {
  if (!data.top_tracks?.length) return null;
  const similarArtists = data.artist.similar?.slice(0, 5) || [];

  return (
    <div className="flex items-start gap-30">
      <TopTracksTable tracks={data.top_tracks} />
      {similarArtists.length ? (
        <div className="w-1/3 max-w-320 max-md:hidden">
          <h2 className="my-16 text-base text-muted">
            <Trans message="Similar artists" />
          </h2>
          <div>
            {similarArtists.map(similar => (
              <Link
                key={similar.id}
                to={getArtistLink(similar)}
                className="mb-4 flex cursor-pointer items-center gap-14 rounded p-4 hover:bg-hover"
              >
                <SmallArtistImage
                  artist={similar}
                  className="h-44 w-44 rounded-full object-cover"
                />
                <div className="text-sm">{similar.name}</div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
