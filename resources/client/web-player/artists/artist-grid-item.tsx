import {FullArtist, PartialArtist} from '@app/web-player/artists/artist';
import {ArtistContextDialog} from '@app/web-player/artists/artist-context-dialog';
import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {ArtistLink, getArtistLink} from '@app/web-player/artists/artist-link';
import {ContentGridItemLayout} from '@app/web-player/channels/content-grid-item-layout';
import {LikeIconButton} from '@app/web-player/library/like-icon-button';
import {PlayableGridItem} from '@app/web-player/playable-item/playable-grid-item';
import {Trans} from '@ui/i18n/trans';

interface ArtistGridItemProps {
  artist: FullArtist | PartialArtist;
  radius?: string;
  layout?: ContentGridItemLayout;
}
export function ArtistGridItem({
  artist,
  radius = 'rounded-full',
  layout,
}: ArtistGridItemProps) {
  const subtitle =
    'followers_count' in artist && artist.followers_count ? (
      <Trans
        message=":count followers"
        values={{count: artist.followers_count}}
      />
    ) : null;
  return (
    <PlayableGridItem
      layout={layout}
      image={<SmallArtistImage artist={artist} />}
      title={<ArtistLink artist={artist} />}
      subtitle={subtitle}
      model={artist}
      link={getArtistLink(artist)}
      likeButton={<LikeIconButton likeable={artist} />}
      contextDialog={<ArtistContextDialog artist={artist} />}
      radius={radius}
    />
  );
}
