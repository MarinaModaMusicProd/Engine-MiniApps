import {appQueries} from '@app/app-queries';
import {TrackList} from '@app/web-player/tracks/track-list/track-list';
import {PartialUserProfile} from '@app/web-player/users/user-profile';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {AudiotrackIcon} from '@ui/icons/material/Audiotrack';
import {IllustratedMessage} from '@ui/images/illustrated-message';
import {useOutletContext} from 'react-router';

export function Component() {
  const user = useOutletContext<PartialUserProfile>();
  const query = useSuspenseInfiniteQuery(appQueries.tracks.liked(user.id));
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
            message="Follow :user for updates on tracks they like in the future."
            values={{user: user.name}}
          />
        }
      />
    );
  }

  return <TrackList tracks={tracks} query={query} />;
}
