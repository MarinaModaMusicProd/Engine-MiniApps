import {appQueries} from '@app/app-queries';
import {AlbumGridItem} from '@app/web-player/albums/album-grid-item';
import {AlbumListItem} from '@app/web-player/albums/album-list/album-list-item';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {TrackGridItem} from '@app/web-player/tracks/track-grid-item';
import {TrackListItem} from '@app/web-player/tracks/track-list/track-list-item';
import {PartialUserProfile} from '@app/web-player/users/user-profile';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {AudiotrackIcon} from '@ui/icons/material/Audiotrack';
import {IllustratedMessage} from '@ui/images/illustrated-message';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {useOutletContext} from 'react-router';

export function Component() {
  const user = useOutletContext<PartialUserProfile>();
  const isMobile = useIsMobileMediaQuery();
  const query = useSuspenseInfiniteQuery(appQueries.reposts.index(user.id));
  const reposts = useFlatInfiniteQueryItems(query);

  if (!reposts.length) {
    return (
      <IllustratedMessage
        imageHeight="h-auto"
        imageMargin="mb-14"
        image={<AudiotrackIcon size="lg" className="text-muted" />}
        title={<Trans message="No reposts yet" />}
        description={
          <Trans
            message="Follow :user for updates on tracks and albums they repost in the future."
            values={{user: user.name}}
          />
        }
      />
    );
  }

  if (isMobile) {
    return (
      <div>
        <ContentGrid>
          {reposts.map(repost => {
            if (repost.repostable?.model_type === 'track') {
              return (
                <TrackGridItem track={repost.repostable} key={repost.id} />
              );
            } else if (repost.repostable?.model_type === 'album') {
              return (
                <AlbumGridItem album={repost.repostable} key={repost.id} />
              );
            }
            return null;
          })}
        </ContentGrid>
        <InfiniteScrollSentinel query={query} />
      </div>
    );
  }

  return (
    <div>
      {reposts.map(repost => {
        if (repost.repostable?.model_type === 'track') {
          return (
            <TrackListItem
              className="mb-40"
              key={repost.id}
              track={repost.repostable}
              reposter={user}
            />
          );
        } else if (repost.repostable?.model_type === 'album') {
          return (
            <AlbumListItem
              key={repost.id}
              album={repost.repostable}
              reposter={user}
              className="mb-40"
            />
          );
        }
        return null;
      })}
      <InfiniteScrollSentinel query={query} />
    </div>
  );
}
