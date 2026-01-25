import {ChannelContentModel} from '@app/admin/channels/channel-content-config';
import {ALBUM_MODEL} from '@app/web-player/albums/album';
import {AlbumGridItem} from '@app/web-player/albums/album-grid-item';
import {ARTIST_MODEL} from '@app/web-player/artists/artist';
import {ArtistGridItem} from '@app/web-player/artists/artist-grid-item';
import {ContentGridItemLayout} from '@app/web-player/channels/content-grid-item-layout';
import {GENRE_MODEL} from '@app/web-player/genres/genre';
import {GenreGridItem} from '@app/web-player/genres/genre-grid-item';
import {PLAYLIST_MODEL} from '@app/web-player/playlists/playlist';
import {PlaylistGridItem} from '@app/web-player/playlists/playlist-grid-item';
import {Track, TRACK_MODEL} from '@app/web-player/tracks/track';
import {TrackGridItem} from '@app/web-player/tracks/track-grid-item';
import {UserGridItem} from '@app/web-player/users/user-grid-item';
import {USER_MODEL} from '@ui/types/user';

interface Props {
  item: ChannelContentModel;
  items?: ChannelContentModel[];
  layout?: ContentGridItemLayout;
}
export function ChannelContentGridItem({item, items, layout}: Props) {
  switch (item.model_type) {
    case ARTIST_MODEL:
      return <ArtistGridItem artist={item} layout={layout} />;
    case ALBUM_MODEL:
      return <AlbumGridItem album={item} layout={layout} />;
    case GENRE_MODEL:
      return <GenreGridItem genre={item} layout={layout} />;
    case TRACK_MODEL:
      return (
        <TrackGridItem
          track={item}
          newQueue={items as Track[]}
          layout={layout}
        />
      );
    case PLAYLIST_MODEL:
      return <PlaylistGridItem playlist={item} layout={layout} />;
    case USER_MODEL:
      return <UserGridItem user={item} layout={layout} />;
    default:
      return null;
  }
}
