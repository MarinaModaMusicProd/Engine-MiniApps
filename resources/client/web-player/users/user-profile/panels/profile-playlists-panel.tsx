import {appQueries} from '@app/app-queries';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {PlaylistGridItem} from '@app/web-player/playlists/playlist-grid-item';
import {PartialUserProfile} from '@app/web-player/users/user-profile';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {QueueMusicIcon} from '@ui/icons/material/QueueMusic';
import {IllustratedMessage} from '@ui/images/illustrated-message';
import {useOutletContext} from 'react-router';

export function Component() {
  const user = useOutletContext<PartialUserProfile>();
  const query = useSuspenseInfiniteQuery(
    appQueries.playlists.userPlaylists(user.id),
  );
  const playlists = useFlatInfiniteQueryItems(query);

  if (!playlists.length) {
    return (
      <IllustratedMessage
        imageHeight="h-auto"
        imageMargin="mb-14"
        image={<QueueMusicIcon size="lg" className="text-muted" />}
        title={<Trans message="No playlists yet" />}
        description={
          <Trans
            message="Follow :user for updates on playlists they create in the future."
            values={{user: user.name}}
          />
        }
      />
    );
  }

  return (
    <div>
      <ContentGrid>
        {playlists.map(playlist => (
          <PlaylistGridItem key={playlist.id} playlist={playlist} />
        ))}
      </ContentGrid>
      <InfiniteScrollSentinel query={query} />
    </div>
  );
}
