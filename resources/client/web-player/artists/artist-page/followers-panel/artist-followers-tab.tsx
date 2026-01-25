import {appQueries} from '@app/app-queries';
import {FollowerListItem} from '@app/web-player/artists/artist-page/followers-panel/follower-list-item';
import {GetArtistResponse} from '@app/web-player/artists/requests/get-artist-response';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {BookmarkBorderIcon} from '@ui/icons/material/BookmarkBorder';
import {IllustratedMessage} from '@ui/images/illustrated-message';

interface Props {
  data: GetArtistResponse;
}
export function ArtistFollowersTab({data}: Props) {
  const query = useSuspenseInfiniteQuery(
    appQueries.artists.show(data.artist.id).followers(data.followers),
  );
  const followers = useFlatInfiniteQueryItems(query);

  if (!followers.length) {
    return (
      <IllustratedMessage
        imageHeight="h-auto"
        imageMargin="mb-14"
        image={<BookmarkBorderIcon size="lg" className="text-muted" />}
        description={
          <Trans
            message="Seems like no one is following :name yet."
            values={{name: data.artist.name}}
          />
        }
      />
    );
  }

  return (
    <div>
      {followers.map(follower => (
        <FollowerListItem key={follower.id} follower={follower} />
      ))}
      <InfiniteScrollSentinel query={query} />
    </div>
  );
}
