import {appQueries} from '@app/app-queries';
import {TrackList} from '@app/web-player/tracks/track-list/track-list';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {AudiotrackIcon} from '@ui/icons/material/Audiotrack';
import {IllustratedMessage} from '@ui/images/illustrated-message';

export function Component() {
  const {tagName} = useRequiredParams(['tagName']);
  const query = useSuspenseInfiniteQuery(appQueries.tracks.byTag(tagName));
  const tracks = useFlatInfiniteQueryItems(query);

  if (!tracks.length) {
    return (
      <IllustratedMessage
        imageHeight="h-auto"
        imageMargin="mb-14"
        image={<AudiotrackIcon size="lg" className="text-muted" />}
        title={<Trans message="No tracks yet" />}
        description={
          <Trans message="This tag is not attached to any tracks yet, check back later." />
        }
      />
    );
  }

  return <TrackList tracks={tracks} query={query} />;
}
