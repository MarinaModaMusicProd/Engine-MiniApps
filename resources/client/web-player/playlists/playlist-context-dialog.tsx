import {
  offlinedEntitiesStore,
  useOfflineEntitiesStore,
} from '@app/offline/offline-entities-store';
import {useCanOffline} from '@app/offline/use-can-offline';
import {AddToQueueButton} from '@app/web-player/context-dialog/add-to-queue-menu-button';
import {
  ContextDialogLayout,
  ContextMenuButton,
} from '@app/web-player/context-dialog/context-dialog-layout';
import {ShareMediaButton} from '@app/web-player/context-dialog/share-media-button';
import {UpdatePlaylistDialog} from '@app/web-player/playlists/crupdate-dialog/update-playlist-dialog';
import {useIsFollowingPlaylist} from '@app/web-player/playlists/hooks/use-is-following-playlist';
import {usePlaylistPermissions} from '@app/web-player/playlists/hooks/use-playlist-permissions';
import {
  FullPlaylist,
  PartialPlaylist,
} from '@app/web-player/playlists/playlist';
import {PlaylistOwnerName} from '@app/web-player/playlists/playlist-grid-item';
import {PlaylistImage} from '@app/web-player/playlists/playlist-image';
import {
  PlaylistLink,
  getPlaylistLink,
} from '@app/web-player/playlists/playlist-link';
import {useDeletePlaylist} from '@app/web-player/playlists/requests/use-delete-playlist';
import {useFollowPlaylist} from '@app/web-player/playlists/requests/use-follow-playlist';
import {useUnfollowPlaylist} from '@app/web-player/playlists/requests/use-unfollow-playlist';
import {useUpdatePlaylist} from '@app/web-player/playlists/requests/use-update-playlist';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {loadMediaItemTracks} from '@app/web-player/requests/load-media-item-tracks';
import {Track} from '@app/web-player/tracks/track';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {CheckIcon} from '@ui/icons/material/Check';
import {ConfirmationDialog} from '@ui/overlays/dialog/confirmation-dialog';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {openDialog} from '@ui/overlays/store/dialog-store';
import {toast} from '@ui/toast/toast';
import useClipboard from '@ui/utils/hooks/use-clipboard';
import {Fragment, useCallback} from 'react';

interface PlaylistContextDialogProps {
  playlist: PartialPlaylist | FullPlaylist;
}
export function PlaylistContextDialog({playlist}: PlaylistContextDialogProps) {
  const {close: closeMenu} = useDialogContext();
  const [, copyAlbumLink] = useClipboard(
    getPlaylistLink(playlist, {absolute: true}),
  );
  const {canEdit} = usePlaylistPermissions(playlist);

  const loadTracks = useCallback(() => {
    return loadPlaylistTracks(playlist);
  }, [playlist]);

  return (
    <ContextDialogLayout
      image={<PlaylistImage playlist={playlist} />}
      title={<PlaylistLink playlist={playlist} />}
      description={<PlaylistOwnerName playlist={playlist} />}
      loadTracks={loadTracks}
    >
      <AddToQueueButton item={playlist} loadTracks={loadTracks} />
      <TogglePublicButton playlist={playlist} />
      <ToggleCollaborativeButton playlist={playlist} />
      <FollowButtons playlist={playlist} />
      <OfflinePlaylistButton playlist={playlist} />
      <ContextMenuButton
        onClick={() => {
          copyAlbumLink();
          closeMenu();
          toast(message('Copied link to clipboard'));
        }}
      >
        <Trans message="Copy playlist link" />
      </ContextMenuButton>
      {playlist.public && <ShareMediaButton item={playlist} />}
      {canEdit && (
        <ContextMenuButton
          onClick={() => {
            closeMenu();
            openDialog(UpdatePlaylistDialog, {playlist});
          }}
        >
          <Trans message="Edit" />
        </ContextMenuButton>
      )}
      <DeleteButton playlist={playlist} />
    </ContextDialogLayout>
  );
}

interface FollowButtonsProps {
  playlist: PartialPlaylist;
}
function FollowButtons({playlist}: FollowButtonsProps) {
  const isFollowing = useIsFollowingPlaylist(playlist.id);
  const {close: closeMenu} = useDialogContext();
  const followPlaylist = useFollowPlaylist(playlist);
  const unFollowPlaylist = useUnfollowPlaylist(playlist);
  const {isCreator} = usePlaylistPermissions(playlist);

  // if user has created this playlist, bail
  if (isCreator) {
    return null;
  }

  return (
    <Fragment>
      {!isFollowing ? (
        <ContextMenuButton
          onClick={() => {
            closeMenu();
            followPlaylist.mutate();
          }}
        >
          <Trans message="Follow" />
        </ContextMenuButton>
      ) : (
        <ContextMenuButton
          onClick={() => {
            closeMenu();
            unFollowPlaylist.mutate();
          }}
        >
          <Trans message="Unfollow" />
        </ContextMenuButton>
      )}
    </Fragment>
  );
}

type OfflinePlaylistButtonProps = {
  playlist: PartialPlaylist | FullPlaylist;
};
function OfflinePlaylistButton({playlist}: OfflinePlaylistButtonProps) {
  const {close: closeMenu} = useDialogContext();
  const canOffline = useCanOffline();
  const isOfflined = useOfflineEntitiesStore(s =>
    s.offlinedPlaylistIds.has(playlist.id),
  );

  if (!canOffline) {
    return null;
  }

  return (
    <ContextMenuButton
      enableWhileOffline
      onClick={async () => {
        closeMenu();
        if (isOfflined) {
          offlinedEntitiesStore().deleteOfflinedMediaItem(playlist);
        } else {
          offlinedEntitiesStore().offlineMediaItem(playlist);
        }
      }}
    >
      {isOfflined ? (
        <Trans message="Remove from this device" />
      ) : (
        <Trans message="Make available offline" />
      )}
    </ContextMenuButton>
  );
}

function TogglePublicButton({playlist}: FollowButtonsProps) {
  const {close: closeMenu} = useDialogContext();
  const updatePlaylist = useUpdatePlaylist({playlistId: playlist.id});
  const {isCreator} = usePlaylistPermissions(playlist);

  if (!isCreator) {
    return null;
  }

  const togglePublic = () => {
    closeMenu();
    updatePlaylist.mutate({public: !playlist.public});
  };

  return (
    <ContextMenuButton
      disabled={updatePlaylist.isPending}
      onClick={() => togglePublic()}
    >
      {playlist.public ? (
        <Trans message="Make private" />
      ) : (
        <Trans message="Make public" />
      )}
    </ContextMenuButton>
  );
}

function ToggleCollaborativeButton({playlist}: FollowButtonsProps) {
  const {close: closeMenu} = useDialogContext();
  const updatePlaylist = useUpdatePlaylist({playlistId: playlist.id});
  const {isCreator} = usePlaylistPermissions(playlist);

  if (!isCreator) {
    return null;
  }

  const toggleCollaborative = () => {
    closeMenu();
    updatePlaylist.mutate({collaborative: !playlist.collaborative});
  };

  return (
    <ContextMenuButton
      disabled={updatePlaylist.isPending}
      startIcon={playlist.collaborative ? <CheckIcon /> : undefined}
      onClick={() => toggleCollaborative()}
    >
      <Trans message="Collaborative" />
    </ContextMenuButton>
  );
}

function DeleteButton({playlist}: FollowButtonsProps) {
  const {close: closeMenu} = useDialogContext();
  const deletePlaylist = useDeletePlaylist(playlist.id);
  const {canDelete} = usePlaylistPermissions(playlist);

  if (!canDelete) {
    return null;
  }

  return (
    <ContextMenuButton
      disabled={deletePlaylist.isPending}
      onClick={() => {
        closeMenu();
        openDialog(DeletePlaylistDialog, {playlistId: playlist.id});
      }}
    >
      <Trans message="Delete" />
    </ContextMenuButton>
  );
}

function DeletePlaylistDialog({playlistId}: {playlistId: number}) {
  const deletePlaylist = useDeletePlaylist(playlistId);
  const {close} = useDialogContext();
  return (
    <ConfirmationDialog
      isDanger
      title={<Trans message="Delete playlist" />}
      body={<Trans message="Are you sure you want to delete this playlist?" />}
      confirm={<Trans message="Delete" />}
      onConfirm={() => {
        deletePlaylist.mutate(undefined, {
          onSuccess: () => close(),
        });
      }}
    />
  );
}

async function loadPlaylistTracks(playlist: PartialPlaylist): Promise<Track[]> {
  const tracks = await loadMediaItemTracks(queueGroupId(playlist));
  if (!tracks.length) {
    toast(message('This playlist has no tracks yet.'));
  }
  return tracks;
}
