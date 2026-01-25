import {appQueries} from '@app/app-queries';
import {useCanOffline} from '@app/offline/use-can-offline';
import {webPlayerSidebarIcons} from '@app/web-player/layout/web-player-sidebar-icons';
import {CreatePlaylistDialog} from '@app/web-player/playlists/crupdate-dialog/create-playlist-dialog';
import {getPlaylistLink} from '@app/web-player/playlists/playlist-link';
import {useAuthClickCapture} from '@app/web-player/use-auth-click-capture';
import {useAuth} from '@common/auth/use-auth';
import {CustomMenu, CustomMenuItem} from '@common/menus/custom-menu';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {useQuery} from '@tanstack/react-query';
import {IconButton} from '@ui/buttons/icon-button';
import {Trans} from '@ui/i18n/trans';
import {PlaylistAddIcon} from '@ui/icons/material/PlaylistAdd';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {useSettings} from '@ui/settings/use-settings';
import clsx from 'clsx';
import {ReactNode} from 'react';
import {NavLink} from 'react-router';

const menuItemClassName = (isActive: boolean): string => {
  return clsx(
    'h-44 px-12 mx-12 rounded-panel transition-button',
    isActive ? 'bg-selected font-semibold' : 'hover:bg-hover',
  );
};

interface Props {
  className?: string;
}
export function Sidenav({className}: Props) {
  const canOffline = useCanOffline();
  const {homepage} = useSettings();
  const {isLoggedIn} = useAuth();
  return (
    <div className={clsx('overflow-y-auto py-12', className)}>
      <CustomMenu
        className="items-stretch"
        menu="sidebar-primary"
        orientation="vertical"
        gap="gap-none"
        itemClassName={({isActive}) => menuItemClassName(isActive)}
        defaultIcons={webPlayerSidebarIcons}
      >
        {(_, {item, ...props}) => {
          // make sure "home" menu item leads to homepage channel and not landing page,
          // when homepage is set to landing page and user is not logged in.
          if (
            item.action === '/' &&
            homepage?.type === 'landingPage' &&
            !isLoggedIn
          ) {
            item.action = '/discover';
          }
          return <CustomMenuItem key={item.id} item={item} {...props} />;
        }}
      </CustomMenu>
      <div className="mt-48">
        <SectionTitle>
          <Trans message="Library" />
        </SectionTitle>
        <CustomMenu
          className="mt-12 items-stretch"
          menu="sidebar-secondary"
          orientation="vertical"
          gap="gap-none"
          itemClassName={({isActive}) => menuItemClassName(isActive)}
          defaultIcons={webPlayerSidebarIcons}
        >
          {(item, props) => {
            return item.action === '/library/downloads' &&
              !canOffline ? null : (
              <CustomMenuItem key={item.id} {...props} />
            );
          }}
        </CustomMenu>
        <PlaylistSection />
      </div>
    </div>
  );
}

interface SectionTitleProps {
  children?: ReactNode;
}
function SectionTitle({children}: SectionTitleProps) {
  return (
    <div className="mx-24 mb-8 text-xs font-semibold uppercase text-muted">
      {children}
    </div>
  );
}

function PlaylistSection() {
  const {data} = useQuery(appQueries.playlists.compactAuthUserPlaylists());
  const navigate = useNavigate();
  const authHandler = useAuthClickCapture();

  return (
    <div className="mt-40">
      <div className="mr-24 flex items-center justify-between">
        <SectionTitle>
          <Trans message="Playlists" />
        </SectionTitle>
        <DialogTrigger
          type="modal"
          onClose={newPlaylist => {
            if (newPlaylist) {
              navigate(getPlaylistLink(newPlaylist));
            }
          }}
        >
          <IconButton
            className="flex-shrink-0 text-muted"
            onClickCapture={authHandler}
          >
            <PlaylistAddIcon />
          </IconButton>
          <CreatePlaylistDialog />
        </DialogTrigger>
      </div>
      {data?.map(playlist => (
        <NavLink
          to={getPlaylistLink(playlist)}
          key={playlist.id}
          className={({isActive}) =>
            clsx(menuItemClassName(isActive), 'flex items-center')
          }
        >
          <div className="overflow-hidden overflow-ellipsis">
            {playlist.name}
          </div>
        </NavLink>
      ))}
    </div>
  );
}
