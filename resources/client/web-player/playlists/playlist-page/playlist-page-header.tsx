import {OfflineMediaItemButton} from '@app/offline/offline-media-item-button';
import {UploadType} from '@app/site-config';
import {BulletSeparatedItems} from '@app/web-player/layout/bullet-separated-items';
import {
  actionButtonClassName,
  MediaPageHeaderLayout,
} from '@app/web-player/layout/media-page-header-layout';
import {PlaybackToggleButton} from '@app/web-player/playable-item/playback-toggle-button';
import {usePlaylistPermissions} from '@app/web-player/playlists/hooks/use-playlist-permissions';
import {FullPlaylist} from '@app/web-player/playlists/playlist';
import {PlaylistContextDialog} from '@app/web-player/playlists/playlist-context-dialog';
import {PlaylistImage} from '@app/web-player/playlists/playlist-image';
import {FollowPlaylistButton} from '@app/web-player/playlists/playlist-page/follow-playlist-button';
import {useUpdatePlaylist} from '@app/web-player/playlists/requests/use-update-playlist';
import {getUserProfileLink} from '@app/web-player/users/user-profile-link';
import {ImageSelector} from '@common/uploads/components/image-selector';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {Avatar} from '@ui/avatar/avatar';
import {AvatarGroup} from '@ui/avatar/avatar-group';
import {Button} from '@ui/buttons/button';
import {FormattedDuration} from '@ui/i18n/formatted-duration';
import {Trans} from '@ui/i18n/trans';
import {ArrowDropDownIcon} from '@ui/icons/material/ArrowDropDown';
import {MusicNoteIcon} from '@ui/icons/material/MusicNote';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {Fragment} from 'react';

interface PlaylistPageHeaderProps {
  playlist: FullPlaylist;
  totalDuration: number;
  queueId: string;
}
export function PlaylistPageHeader({
  playlist,
  totalDuration,
  queueId,
}: PlaylistPageHeaderProps) {
  return (
    <Fragment>
      <MediaPageHeaderLayout
        image={<EditableImage playlist={playlist} />}
        title={playlist.name}
        subtitle={
          <AvatarGroup>
            {playlist.editors.map(editor => (
              <Avatar
                key={editor.id}
                circle
                src={editor.image}
                label={editor.name}
                link={getUserProfileLink(editor)}
              />
            ))}
          </AvatarGroup>
        }
        description={
          <Fragment>
            {playlist.description}
            {playlist.tracks_count ? (
              <BulletSeparatedItems className="mt-14 text-sm text-muted">
                <Trans
                  message="[one 1 track|other :count tracks]"
                  values={{count: playlist.tracks_count}}
                />
                <FormattedDuration ms={totalDuration} verbose />
                {playlist.collaborative && <Trans message="Collaborative" />}
              </BulletSeparatedItems>
            ) : null}
          </Fragment>
        }
        actionsBar={
          <ActionButtons
            playlist={playlist}
            hasTracks={totalDuration > 0}
            queueId={queueId}
          />
        }
      />
    </Fragment>
  );
}

interface ImageContainerProps {
  playlist: FullPlaylist;
  size?: string;
  className?: string;
}
function EditableImage({playlist, size, className}: ImageContainerProps) {
  const updatePlaylist = useUpdatePlaylist();
  const {canEdit} = usePlaylistPermissions(playlist);

  if (!canEdit) {
    return (
      <PlaylistImage
        className={`${size} ${className} rounded-panel object-cover`}
        playlist={playlist}
      />
    );
  }

  return (
    <FileUploadProvider>
      <ImageSelector
        uploadType={UploadType.artwork}
        variant="square"
        previewSize={size}
        previewRadius="rounded-panel"
        className={className}
        value={playlist.image}
        onChange={newValue => {
          updatePlaylist.mutate({image: newValue});
        }}
        placeholderIcon={<MusicNoteIcon size="xl" />}
        stretchPreview
      />
    </FileUploadProvider>
  );
}

interface ActionButtonsProps {
  playlist: FullPlaylist;
  hasTracks: boolean;
  queueId: string;
}
function ActionButtons({playlist, hasTracks, queueId}: ActionButtonsProps) {
  return (
    <div className="text-center md:text-start">
      <PlaybackToggleButton
        disabled={!hasTracks}
        buttonType="text"
        queueId={queueId}
        className={actionButtonClassName({isFirst: true})}
      />
      <OfflineMediaItemButton
        className="mr-8"
        item={playlist}
        totalTracksCount={playlist.tracks_count ?? 0}
      />
      <FollowPlaylistButton
        buttonType="text"
        playlist={playlist}
        className={actionButtonClassName()}
      />
      <DialogTrigger type="popover" mobileType="tray">
        <Button
          variant="outline"
          radius="rounded-full"
          endIcon={<ArrowDropDownIcon />}
          className={actionButtonClassName()}
        >
          <Trans message="More" />
        </Button>
        <PlaylistContextDialog playlist={playlist} />
      </DialogTrigger>
    </div>
  );
}
