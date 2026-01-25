import {
  offlinedEntitiesStore,
  useOfflineEntitiesStore,
} from '@app/offline/offline-entities-store';
import {useCanOffline} from '@app/offline/use-can-offline';
import {getAlbumLink} from '@app/web-player/albums/album-link';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {AddToQueueButton} from '@app/web-player/context-dialog/add-to-queue-menu-button';
import {
  ContextDialogLayout,
  ContextMenuButton,
  ContextMenuLayoutProps,
} from '@app/web-player/context-dialog/context-dialog-layout';
import {CopyLinkMenuButton} from '@app/web-player/context-dialog/copy-link-menu-button';
import {PlaylistPanelButton} from '@app/web-player/context-dialog/playlist-panel';
import {ShareMediaButton} from '@app/web-player/context-dialog/share-media-button';
import {ToggleInLibraryMenuButton} from '@app/web-player/context-dialog/toggle-in-library-menu-button';
import {ToggleRepostMenuButton} from '@app/web-player/context-dialog/toggle-repost-menu-button';
import {getRadioLink} from '@app/web-player/radio/get-radio-link';
import {useShouldShowRadioButton} from '@app/web-player/tracks/context-dialog/use-should-show-radio-button';
import {useTrackPermissions} from '@app/web-player/tracks/hooks/use-track-permissions';
import {useDeleteTracks} from '@app/web-player/tracks/requests/use-delete-tracks';
import {Track} from '@app/web-player/tracks/track';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {getTrackLink, TrackLink} from '@app/web-player/tracks/track-link';
import {trackIsLocallyUploaded} from '@app/web-player/tracks/utils/track-is-locally-uploaded';
import {trackToMediaItem} from '@app/web-player/tracks/utils/track-to-media-item';
import {useAuth} from '@common/auth/use-auth';
import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Trans} from '@ui/i18n/trans';
import {ConfirmationDialog} from '@ui/overlays/dialog/confirmation-dialog';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {openDialog} from '@ui/overlays/store/dialog-store';
import {useSettings} from '@ui/settings/use-settings';
import {downloadFileFromUrl} from '@ui/utils/files/download-file-from-url';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {Fragment, ReactNode, useCallback} from 'react';

export interface TrackContextDialogProps {
  tracks: Track[];
  children?: (tracks: Track[]) => ReactNode;
  showAddToQueueButton?: boolean;
}
export function TrackContextDialog({
  children,
  tracks,
  showAddToQueueButton = true,
}: TrackContextDialogProps) {
  const isMobile = useIsMobileMediaQuery();
  const firstTrack = tracks[0];
  const {canEdit, canDelete} = useTrackPermissions(tracks);
  const shouldShowRadio = useShouldShowRadioButton();
  const {player} = useSettings();
  const {close} = useDialogContext();
  const navigate = useNavigate();
  const cuedTrack = usePlayerStore(s => s.cuedMedia?.meta as Track | undefined);
  const {play} = usePlayerActions();

  const loadTracks = useCallback(() => {
    return Promise.resolve(tracks);
  }, [tracks]);

  const headerProps: Partial<ContextMenuLayoutProps> =
    tracks.length === 1
      ? {
          image: <TrackImage track={firstTrack} />,
          title: <TrackLink track={firstTrack} />,
          description: <ArtistLinks artists={firstTrack.artists} />,
        }
      : {};

  return (
    <ContextDialogLayout {...headerProps} loadTracks={loadTracks}>
      {showAddToQueueButton && (
        <AddToQueueButton item={null} loadTracks={loadTracks} />
      )}
      <ToggleInLibraryMenuButton items={tracks} />
      {children?.(tracks)}
      <PlaylistPanelButton />
      {tracks.length === 1 ? (
        <Fragment>
          {shouldShowRadio && (
            <ContextMenuButton type="link" to={getRadioLink(firstTrack)}>
              <Trans message="Go to song radio" />
            </ContextMenuButton>
          )}
          {isMobile && (
            <Fragment>
              {firstTrack.artists?.[0] && (
                <ContextMenuButton
                  type="link"
                  to={getArtistLink(firstTrack.artists[0])}
                >
                  <Trans message="Go to artist" />
                </ContextMenuButton>
              )}
              {firstTrack.album && (
                <ContextMenuButton
                  type="link"
                  to={getAlbumLink(firstTrack.album)}
                >
                  <Trans message="Go to album" />
                </ContextMenuButton>
              )}
              <ContextMenuButton
                type="link"
                to={getTrackLink(firstTrack)}
                enableWhileOffline
              >
                <Trans message="Go to track" />
              </ContextMenuButton>
            </Fragment>
          )}
          {!player?.hide_lyrics && tracks.length === 1 && (
            <ContextMenuButton
              onClick={async () => {
                close();
                if (cuedTrack?.id !== firstTrack.id) {
                  await play(await trackToMediaItem(firstTrack));
                }
                navigate('/lyrics');
              }}
            >
              <Trans message="View lyrics" />
            </ContextMenuButton>
          )}
          {!isMobile && (
            <CopyLinkMenuButton
              link={getTrackLink(firstTrack, {absolute: true})}
            >
              <Trans message="Copy song link" />
            </CopyLinkMenuButton>
          )}
          <OfflineTracksButton tracks={tracks} />
          {tracks.length === 1 && <ShareMediaButton item={firstTrack} />}
          {tracks.length === 1 && <DownloadTrackButton track={firstTrack} />}
          {tracks.length === 1 ? (
            <ToggleRepostMenuButton item={tracks[0]} />
          ) : null}
          {tracks.length === 1 && canEdit && (
            <ContextMenuButton
              type="link"
              to={`/backstage/tracks/${firstTrack.id}/insights`}
            >
              <Trans message="Insights" />
            </ContextMenuButton>
          )}
          {tracks.length === 1 && canEdit && (
            <ContextMenuButton
              type="link"
              to={`/backstage/tracks/${firstTrack.id}/edit`}
            >
              <Trans message="Edit" />
            </ContextMenuButton>
          )}
        </Fragment>
      ) : null}
      {canDelete && !isMobile && <DeleteButton tracks={tracks} />}
    </ContextDialogLayout>
  );
}

type DownloadOfflineButtonProps = {
  tracks: Track[];
};
function OfflineTracksButton({tracks}: DownloadOfflineButtonProps) {
  const {close: closeMenu} = useDialogContext();
  const canOffline = useCanOffline();
  const allTracksOfflined = useOfflineEntitiesStore(s =>
    tracks.every(t => s.offlinedTrackIds.has(t.id)),
  );

  if (!canOffline) {
    return null;
  }

  return (
    <ContextMenuButton
      enableWhileOffline
      onClick={async () => {
        closeMenu();
        if (allTracksOfflined) {
          offlinedEntitiesStore().deleteOfflinedTracks(tracks);
        } else {
          offlinedEntitiesStore().offlineTracks(tracks);
        }
      }}
    >
      {allTracksOfflined ? (
        <Trans message="Remove from this device" />
      ) : (
        <Trans message="Make available offline" />
      )}
    </ContextMenuButton>
  );
}

interface DownloadTrackButtonProps {
  track: Track;
}
function DownloadTrackButton({track}: DownloadTrackButtonProps) {
  const {player, base_url} = useSettings();
  const {close: closeMenu} = useDialogContext();
  const {hasPermission} = useAuth();

  if (
    !player?.enable_download ||
    !track ||
    !trackIsLocallyUploaded(track) ||
    !hasPermission('music.download')
  ) {
    return null;
  }

  return (
    <ContextMenuButton
      onClick={() => {
        closeMenu();
        downloadFileFromUrl(`${base_url}/api/v1/tracks/${track.id}/download`);
      }}
    >
      <Trans message="Download" />
    </ContextMenuButton>
  );
}

function DeleteButton({tracks}: TrackContextDialogProps) {
  const {close: closeMenu} = useDialogContext();
  const {canDelete} = useTrackPermissions(tracks);

  if (!canDelete) {
    return null;
  }

  return (
    <ContextMenuButton
      onClick={() => {
        closeMenu();
        openDialog(DeleteTrackDialog, {
          tracks,
        });
      }}
    >
      <Trans message="Delete" />
    </ContextMenuButton>
  );
}

interface DeleteTrackDialogProps {
  tracks: Track[];
}
function DeleteTrackDialog({tracks}: DeleteTrackDialogProps) {
  const deleteTracks = useDeleteTracks();
  const {close} = useDialogContext();
  return (
    <ConfirmationDialog
      isDanger
      title={<Trans message="Delete tracks" />}
      body={
        <Trans message="Are you sure you want to delete selected tracks?" />
      }
      isLoading={deleteTracks.isPending}
      confirm={<Trans message="Delete" />}
      onConfirm={() => {
        deleteTracks.mutate(
          {trackIds: tracks.map(t => t.id)},
          {
            onSuccess: () => close(),
          },
        );
      }}
    />
  );
}
