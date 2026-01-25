import {appQueries} from '@app/app-queries';
import {GetArtistResponse} from '@app/web-player/artists/requests/get-artist-response';
import {TrackList} from '@app/web-player/tracks/track-list/track-list';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {AudiotrackIcon} from '@ui/icons/material/Audiotrack';
import {IllustratedMessage} from '@ui/images/illustrated-message';

interface Props {
  data: GetArtistResponse;
}
export function ArtistTracksTab({data}: Props) {
  const query = useSuspenseInfiniteQuery(
    appQueries.artists.show(data.artist.id).tracks(data.tracks),
  );
  const tracks = useFlatInfiniteQueryItems(query);

  if (!tracks.length) {
    return (
      <IllustratedMessage
        imageHeight="h-auto"
        imageMargin="mb-14"
        image={<AudiotrackIcon size="lg" className="text-muted" />}
        title={<Trans message="No tracks yet" />}
        description={
          <Trans
            message="Follow :artist for updates on their latest releases."
            values={{artist: data.artist.name}}
          />
        }
      />
    );
  }

  return <TrackList tracks={tracks} query={query} />;
}
