import {PlaylistOfflinedIndicator} from '@app/offline/entitiy-offline-indicator-icon';
import {ContentGridItemLayout} from '@app/web-player/channels/content-grid-item-layout';
import {PlayableGridItem} from '@app/web-player/playable-item/playable-grid-item';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {PlaylistContextDialog} from '@app/web-player/playlists/playlist-context-dialog';
import {PlaylistImage} from '@app/web-player/playlists/playlist-image';
import {
  getPlaylistLink,
  PlaylistLink,
} from '@app/web-player/playlists/playlist-link';
import {FollowPlaylistButton} from '@app/web-player/playlists/playlist-page/follow-playlist-button';
import {UserProfileLink} from '@app/web-player/users/user-profile-link';
import {Trans} from '@ui/i18n/trans';

interface PlaylistGridItemProps {
  playlist: PartialPlaylist;
  layout?: ContentGridItemLayout;
}
export function PlaylistGridItem({playlist, layout}: PlaylistGridItemProps) {
  return (
    <PlayableGridItem
      layout={layout}
      image={<PlaylistImage playlist={playlist} />}
      title={<PlaylistLink playlist={playlist} />}
      subtitle={
        <div className="flex items-center gap-4">
          <PlaylistOfflinedIndicator playlistId={playlist.id} />
          <PlaylistOwnerName playlist={playlist} />
        </div>
      }
      link={getPlaylistLink(playlist)}
      likeButton={
        <FollowPlaylistButton buttonType="icon" size="md" playlist={playlist} />
      }
      model={playlist}
      contextDialog={<PlaylistContextDialog playlist={playlist} />}
    />
  );
}

export function PlaylistOwnerName({playlist}: {playlist: PartialPlaylist}) {
  const owner = playlist.editors[0];
  if (!owner) {
    return null;
  }
  return (
    <Trans
      message="By :name"
      values={{
        name: <UserProfileLink user={owner} />,
      }}
    />
  );
}
