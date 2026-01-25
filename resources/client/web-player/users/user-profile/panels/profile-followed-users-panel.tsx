import {appQueries} from '@app/app-queries';
import {FollowerListItem} from '@app/web-player/artists/artist-page/followers-panel/follower-list-item';
import {PartialUserProfile} from '@app/web-player/users/user-profile';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {BookmarkBorderIcon} from '@ui/icons/material/BookmarkBorder';
import {IllustratedMessage} from '@ui/images/illustrated-message';
import {useOutletContext} from 'react-router';

export function Component() {
  const user = useOutletContext<PartialUserProfile>();
  const query = useSuspenseInfiniteQuery(
    appQueries.userProfile(user.id).followedUsers,
  );
  const followedUsers = useFlatInfiniteQueryItems(query);

  if (!followedUsers.length) {
    return (
      <IllustratedMessage
        imageHeight="h-auto"
        imageMargin="mb-14"
        image={<BookmarkBorderIcon size="lg" className="text-muted" />}
        description={
          <Trans
            message="Seems like :name is not following anyone yet."
            values={{name: user.name}}
          />
        }
      />
    );
  }

  return (
    <div>
      {followedUsers.map(followedUser => (
        <FollowerListItem key={followedUser.id} follower={followedUser} />
      ))}
      <InfiniteScrollSentinel query={query} />
    </div>
  );
}
