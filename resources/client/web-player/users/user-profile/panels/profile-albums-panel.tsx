import {appQueries} from '@app/app-queries';
import {AlbumList} from '@app/web-player/albums/album-list/album-list';
import {PartialUserProfile} from '@app/web-player/users/user-profile';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {AlbumIcon} from '@ui/icons/material/Album';
import {IllustratedMessage} from '@ui/images/illustrated-message';
import {useOutletContext} from 'react-router';

export function Component() {
  const user = useOutletContext<PartialUserProfile>();

  const query = useSuspenseInfiniteQuery(
    appQueries.albums.liked(user.id, {
      with: 'tracks',
    }),
  );
  const albums = useFlatInfiniteQueryItems(query);

  if (!albums.length) {
    return (
      <IllustratedMessage
        imageHeight="h-auto"
        imageMargin="mb-14"
        image={<AlbumIcon size="lg" className="text-muted" />}
        title={<Trans message="No albums yet" />}
        description={
          <Trans
            message="Follow :user for updates on albums they like in the future."
            values={{user: user.name}}
          />
        }
      />
    );
  }

  return <AlbumList albums={albums} query={query} />;
}
