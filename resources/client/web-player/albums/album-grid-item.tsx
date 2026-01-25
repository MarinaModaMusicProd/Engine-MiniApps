import {AlbumOfflinedIndicator} from '@app/offline/entitiy-offline-indicator-icon';
import {PartialAlbum} from '@app/web-player/albums/album';
import {AlbumContextDialog} from '@app/web-player/albums/album-context-dialog';
import {AlbumImage} from '@app/web-player/albums/album-image/album-image';
import {AlbumLink, getAlbumLink} from '@app/web-player/albums/album-link';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {ContentGridItemLayout} from '@app/web-player/channels/content-grid-item-layout';
import {LikeIconButton} from '@app/web-player/library/like-icon-button';
import {PlayableGridItem} from '@app/web-player/playable-item/playable-grid-item';

interface AlbumGridItemProps {
  album: PartialAlbum;
  layout?: ContentGridItemLayout;
}
export function AlbumGridItem({album, layout}: AlbumGridItemProps) {
  return (
    <PlayableGridItem
      layout={layout}
      image={<AlbumImage album={album} />}
      title={<AlbumLink album={album} />}
      subtitle={
        <div className="flex items-center gap-4">
          <AlbumOfflinedIndicator albumId={album.id} />
          <ArtistLinks artists={album.artists} />
        </div>
      }
      link={getAlbumLink(album)}
      likeButton={<LikeIconButton likeable={album} />}
      model={album}
      contextDialog={<AlbumContextDialog album={album} />}
    />
  );
}
