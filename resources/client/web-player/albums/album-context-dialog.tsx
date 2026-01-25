import {
  offlinedEntitiesStore,
  useOfflineEntitiesStore,
} from '@app/offline/offline-entities-store';
import {useCanOffline} from '@app/offline/use-can-offline';
import {FullAlbum, PartialAlbum} from '@app/web-player/albums/album';
import {AlbumImage} from '@app/web-player/albums/album-image/album-image';
import {AlbumLink, getAlbumLink} from '@app/web-player/albums/album-link';
import {useDeleteAlbum} from '@app/web-player/albums/requests/use-delete-album';
import {useAlbumPermissions} from '@app/web-player/albums/use-album-permissions';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {AddToQueueButton} from '@app/web-player/context-dialog/add-to-queue-menu-button';
import {
  ContextDialogLayout,
  ContextMenuButton,
} from '@app/web-player/context-dialog/context-dialog-layout';
import {CopyLinkMenuButton} from '@app/web-player/context-dialog/copy-link-menu-button';
import {PlaylistPanelButton} from '@app/web-player/context-dialog/playlist-panel';
import {ShareMediaButton} from '@app/web-player/context-dialog/share-media-button';
import {ToggleInLibraryMenuButton} from '@app/web-player/context-dialog/toggle-in-library-menu-button';
import {ToggleRepostMenuButton} from '@app/web-player/context-dialog/toggle-repost-menu-button';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {loadMediaItemTracks} from '@app/web-player/requests/load-media-item-tracks';
import {Track} from '@app/web-player/tracks/track';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {ConfirmationDialog} from '@ui/overlays/dialog/confirmation-dialog';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {openDialog} from '@ui/overlays/store/dialog-store';
import {toast} from '@ui/toast/toast';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {useCallback} from 'react';

interface AlbumContextMenuProps {
  album: PartialAlbum | FullAlbum;
}
export function AlbumContextDialog({album}: AlbumContextMenuProps) {
  const {canEdit} = useAlbumPermissions(album);
  const isMobile = useIsMobileMediaQuery();

  const loadTracks = useCallback(() => {
    return loadAlbumTracks(album);
  }, [album]);

  return (
    <ContextDialogLayout
      image={<AlbumImage album={album} />}
      title={<AlbumLink album={album} />}
      description={<ArtistLinks artists={album.artists} />}
      loadTracks={loadTracks}
    >
      <AddToQueueButton item={album} loadTracks={loadTracks} />
      <PlaylistPanelButton />
      <ToggleInLibraryMenuButton items={[album]} />
      <OfflineAlbumButton album={album} />
      {album.artists?.[0] && (
        <ContextMenuButton
          type="link"
          to={getArtistLink(album.artists[0])}
          className="md:hidden"
        >
          <Trans message="Go to artist" />
        </ContextMenuButton>
      )}
      {!isMobile && (
        <CopyLinkMenuButton link={getAlbumLink(album, {absolute: true})}>
          <Trans message="Copy album link" />
        </CopyLinkMenuButton>
      )}
      <ShareMediaButton item={album} />
      <ToggleRepostMenuButton item={album} />
      {canEdit && (
        <ContextMenuButton
          type="link"
          to={`/backstage/albums/${album.id}/insights`}
        >
          <Trans message="Insights" />
        </ContextMenuButton>
      )}
      {canEdit && (
        <ContextMenuButton
          type="link"
          to={`/backstage/albums/${album.id}/edit`}
        >
          <Trans message="Edit" />
        </ContextMenuButton>
      )}
      <DeleteButton album={album} />
    </ContextDialogLayout>
  );
}

type OfflineAlbumButtonProps = {
  album: PartialAlbum | FullAlbum;
};
function OfflineAlbumButton({album}: OfflineAlbumButtonProps) {
  const {close: closeMenu} = useDialogContext();
  const canOffline = useCanOffline();
  const isOfflined = useOfflineEntitiesStore(s =>
    s.offlinedAlbumIds.has(album.id),
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
          offlinedEntitiesStore().deleteOfflinedMediaItem(album);
        } else {
          offlinedEntitiesStore().offlineMediaItem(album);
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

function DeleteButton({album}: AlbumContextMenuProps) {
  const {close: closeMenu} = useDialogContext();
  const deleteAlbum = useDeleteAlbum();
  const {canDelete} = useAlbumPermissions(album);

  if (!canDelete) {
    return null;
  }

  return (
    <ContextMenuButton
      disabled={deleteAlbum.isPending}
      onClick={() => {
        closeMenu();
        openDialog(ConfirmationDialog, {
          isDanger: true,
          title: <Trans message="Delete album" />,
          body: <Trans message="Are you sure you want to delete this album?" />,
          confirm: <Trans message="Delete" />,
          onConfirm: () => {
            deleteAlbum.mutate({albumId: album.id});
          },
        });
      }}
    >
      <Trans message="Delete" />
    </ContextMenuButton>
  );
}

async function loadAlbumTracks(
  album: PartialAlbum | FullAlbum,
): Promise<Track[]> {
  // load album tracks if not loaded already
  if (typeof (album as FullAlbum).tracks === 'undefined') {
    const tracks = await loadMediaItemTracks(queueGroupId(album));
    if (!tracks.length) {
      toast(message('This album has no tracks yet.'));
    }
    return tracks;
  }
  return (album as FullAlbum).tracks || [];
}
