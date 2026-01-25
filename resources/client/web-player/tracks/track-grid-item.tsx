import {TrackOfflinedIndicator} from '@app/offline/entitiy-offline-indicator-icon';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {ContentGridItemLayout} from '@app/web-player/channels/content-grid-item-layout';
import {LikeIconButton} from '@app/web-player/library/like-icon-button';
import {PlayableGridItem} from '@app/web-player/playable-item/playable-grid-item';
import {TrackContextDialog} from '@app/web-player/tracks/context-dialog/track-context-dialog';
import {Track} from '@app/web-player/tracks/track';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {getTrackLink, TrackLink} from '@app/web-player/tracks/track-link';

interface TrackGridItemProps {
  track: Track;
  newQueue?: Track[];
  layout?: ContentGridItemLayout;
}
export function TrackGridItem({track, newQueue, layout}: TrackGridItemProps) {
  return (
    <PlayableGridItem
      layout={layout}
      image={<TrackImage track={track} />}
      title={<TrackLink track={track} />}
      subtitle={
        <div className="flex items-center gap-4">
          <TrackOfflinedIndicator trackId={track.id} />
          <ArtistLinks artists={track.artists} />
        </div>
      }
      link={getTrackLink(track)}
      likeButton={<LikeIconButton likeable={track} />}
      model={track}
      newQueue={newQueue}
      contextDialog={<TrackContextDialog tracks={[track]} />}
    />
  );
}
