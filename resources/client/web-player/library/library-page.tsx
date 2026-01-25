import {appQueries} from '@app/app-queries';
import {CreatePlaylistDialog} from '@app/web-player/playlists/crupdate-dialog/create-playlist-dialog';
import {PlaylistImage} from '@app/web-player/playlists/playlist-image';
import {getPlaylistLink} from '@app/web-player/playlists/playlist-link';
import {useAuthClickCapture} from '@app/web-player/use-auth-click-capture';
import {AdHost} from '@common/admin/ads/ad-host';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {IconButton} from '@ui/buttons/icon-button';
import {Trans} from '@ui/i18n/trans';
import {AlbumIcon} from '@ui/icons/material/Album';
import {AudiotrackIcon} from '@ui/icons/material/Audiotrack';
import {HistoryIcon} from '@ui/icons/material/History';
import {MicIcon} from '@ui/icons/material/Mic';
import {PlaylistAddIcon} from '@ui/icons/material/PlaylistAdd';
import {PlaylistPlayIcon} from '@ui/icons/material/PlaylistPlay';
import {SvgIconProps} from '@ui/icons/svg-icon';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {ProgressCircle} from '@ui/progress/progress-circle';
import {useIsTabletMediaQuery} from '@ui/utils/hooks/is-tablet-media-query';
import {ReactElement, ReactNode, Suspense} from 'react';
import {Link, Navigate} from 'react-router';

export function Component() {
  const navigate = useNavigate();
  const authHandler = useAuthClickCapture();

  const isSmallScreen = useIsTabletMediaQuery();

  if (!isSmallScreen) {
    return <Navigate to="/library/songs" replace />;
  }

  return (
    <div>
      <StaticPageTitle>
        <Trans message="Your tracks" />
      </StaticPageTitle>
      <AdHost slot="general_top" className="mb-34" />
      <div className="mb-20 flex items-center justify-between gap-24">
        <h1 className="whitespace-nowrap text-2xl font-semibold">
          <Trans message="Your library" />
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
      <div>
        <MenuItem
          icon={<AudiotrackIcon className="text-main" />}
          to="/library/songs"
        >
          <Trans message="Songs" />
        </MenuItem>
        <MenuItem icon={<PlaylistPlayIcon />} to="/library/playlists">
          <Trans message="Playlists" />
        </MenuItem>
        <MenuItem icon={<AlbumIcon />} to="/library/albums">
          <Trans message="Albums" />
        </MenuItem>
        <MenuItem icon={<MicIcon />} to="/library/artists">
          <Trans message="Artists" />
        </MenuItem>
        <MenuItem icon={<HistoryIcon />} to="/library/history">
          <Trans message="Play history" />
        </MenuItem>
        <Suspense fallback={<ProgressCircle size="xs" isIndeterminate />}>
          <UserPlaylists />
        </Suspense>
      </div>
    </div>
  );
}

function UserPlaylists() {
  const query = useSuspenseInfiniteQuery(
    appQueries.playlists.userPlaylists('me'),
  );
  const playlists = useFlatInfiniteQueryItems(query);
  return (
    <>
      {playlists.map(playlist => (
        <MenuItem
          key={playlist.id}
          wrapIcon={false}
          icon={
            <PlaylistImage
              size="w-42 h-42"
              className="rounded"
              playlist={playlist}
            />
          }
          to={getPlaylistLink(playlist)}
        >
          {playlist.name}
        </MenuItem>
      ))}
      <InfiniteScrollSentinel query={query} />
    </>
  );
}

interface MenuItemProps {
  icon: ReactElement<SvgIconProps>;
  children: ReactNode;
  to: string;
  wrapIcon?: boolean;
}
function MenuItem({icon, children, to, wrapIcon = true}: MenuItemProps) {
  return (
    <Link className="mb-18 flex items-center gap-14 text-sm" to={to}>
      {wrapIcon ? (
        <div className="h-42 w-42 rounded bg-chip p-8">{icon}</div>
      ) : (
        icon
      )}
      {children}
    </Link>
  );
}
