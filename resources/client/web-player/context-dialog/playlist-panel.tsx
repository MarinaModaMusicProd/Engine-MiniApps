import {appQueries} from '@app/app-queries';
import {
  ContextMenuButton,
  ContextMenuLayoutState,
} from '@app/web-player/context-dialog/context-dialog-layout';
import {CreatePlaylistDialog} from '@app/web-player/playlists/crupdate-dialog/create-playlist-dialog';
import {useAddTracksToPlaylist} from '@app/web-player/playlists/requests/use-add-tracks-to-playlist';
import {useAuthClickCapture} from '@app/web-player/use-auth-click-capture';
import {useIsOffline} from '@app/web-player/use-is-offline';
import {useAuth} from '@common/auth/use-auth';
import {useQuery} from '@tanstack/react-query';
import {Button} from '@ui/buttons/button';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {AddIcon} from '@ui/icons/material/Add';
import {KeyboardArrowRightIcon} from '@ui/icons/material/KeyboardArrowRight';
import {KeyboardBackspaceIcon} from '@ui/icons/material/KeyboardBackspace';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {openDialog} from '@ui/overlays/store/dialog-store';
import {toast} from '@ui/toast/toast';
import {m} from 'framer-motion';
import {useContext, useMemo} from 'react';

export function PlaylistPanel() {
  const {data} = useQuery(appQueries.playlists.compactAuthUserPlaylists());
  const {user} = useAuth();
  const {close: closeMenu} = useDialogContext();
  const {loadTracks, setPlaylistPanelIsActive} = useContext(
    ContextMenuLayoutState,
  );
  const addToPlaylist = useAddTracksToPlaylist();

  // only show playlists user created or ones that are collaborative
  const playlists = useMemo(() => {
    return data.filter(p => p.owner_id === user?.id || p.collaborative);
  }, [data, user]);

  return (
    <m.div
      initial={{x: '100%', opacity: 0}}
      animate={{x: 0, opacity: 1}}
      exit={{x: '-100%', opacity: 0}}
      transition={{type: 'tween', duration: 0.14}}
    >
      <div className="my-10 border-b px-10 pb-10">
        <Button
          startIcon={<KeyboardBackspaceIcon />}
          onClick={() => setPlaylistPanelIsActive(false)}
        >
          <Trans message="Back" />
        </Button>
      </div>
      <ul className="max-h-350 overflow-y-auto overflow-x-hidden">
        <ContextMenuButton
          startIcon={<AddIcon />}
          onClick={async () => {
            closeMenu();
            const [playlist, tracks] = await Promise.all([
              openDialog(CreatePlaylistDialog),
              loadTracks(),
            ]);
            if (tracks.length && playlist) {
              addToPlaylist.mutate({
                playlistId: playlist.id,
                tracks,
              });
            }
          }}
          className="text-primary"
        >
          <Trans message="New playlist" />
        </ContextMenuButton>
        {playlists.map(playlist => (
          <ContextMenuButton
            key={playlist.id}
            onClick={async () => {
              closeMenu();
              const tracks = await loadTracks();
              if (tracks?.length && !addToPlaylist.isPending) {
                addToPlaylist.mutate({
                  playlistId: playlist.id,
                  tracks,
                });
              } else {
                toast(message('This item does not have tracks yet'));
              }
            }}
          >
            {playlist.name}
          </ContextMenuButton>
        ))}
      </ul>
    </m.div>
  );
}

export function PlaylistPanelButton() {
  const authHandler = useAuthClickCapture();
  const {playlistPanelIsActive, setPlaylistPanelIsActive} = useContext(
    ContextMenuLayoutState,
  );
  const isOffline = useIsOffline();
  return (
    <ContextMenuButton
      disabled={isOffline}
      endIcon={<KeyboardArrowRightIcon />}
      onClickCapture={authHandler}
      onClick={() => {
        setPlaylistPanelIsActive(!playlistPanelIsActive);
      }}
    >
      <Trans message="Add to playlist" />
    </ContextMenuButton>
  );
}
