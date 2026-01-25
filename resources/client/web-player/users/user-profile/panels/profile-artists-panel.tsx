import {appQueries} from '@app/app-queries';
import {ArtistGridItem} from '@app/web-player/artists/artist-grid-item';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {PartialUserProfile} from '@app/web-player/users/user-profile';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {MicIcon} from '@ui/icons/material/Mic';
import {IllustratedMessage} from '@ui/images/illustrated-message';
import {useOutletContext} from 'react-router';

export function Component() {
  const user = useOutletContext<PartialUserProfile>();
  const query = useSuspenseInfiniteQuery(appQueries.artists.liked(user.id));
  const artists = useFlatInfiniteQueryItems(query);

  if (!artists.length) {
    return (
      <IllustratedMessage
        imageHeight="h-auto"
        imageMargin="mb-14"
        image={<MicIcon size="lg" className="text-muted" />}
        title={<Trans message="No artists yet" />}
        description={
          <Trans
            message="Follow :user for updates on artists they like in the future."
            values={{user: user.name}}
          />
        }
      />
    );
  }

  return (
    <div>
      <ContentGrid>
        {artists.map(artist => (
          <ArtistGridItem key={artist.id} artist={artist} />
        ))}
      </ContentGrid>
      <InfiniteScrollSentinel query={query} />
    </div>
  );
}
