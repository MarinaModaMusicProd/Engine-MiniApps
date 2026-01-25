import {appQueries} from '@app/app-queries';
import {AlbumList} from '@app/web-player/albums/album-list/album-list';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {AlbumIcon} from '@ui/icons/material/Album';
import {IllustratedMessage} from '@ui/images/illustrated-message';

export function Component() {
  const {tagName} = useRequiredParams(['tagName']);
  const query = useSuspenseInfiniteQuery(appQueries.albums.byTag(tagName));
  const albums = useFlatInfiniteQueryItems(query);

  if (!albums.length) {
    return (
      <IllustratedMessage
        imageHeight="h-auto"
        imageMargin="mb-14"
        image={<AlbumIcon size="lg" className="text-muted" />}
        title={<Trans message="No albums yet" />}
        description={
          <Trans message="This tag is not attached to any albums yet, check back later." />
        }
      />
    );
  }

  return <AlbumList albums={albums} query={query} />;
}
