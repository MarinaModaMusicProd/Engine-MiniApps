import {appQueries} from '@app/app-queries';
import {ArtistPageHeader} from '@app/web-player/artists/artist-page/artist-page-header';
import {ArtistPageTabs} from '@app/web-player/artists/artist-page/artist-page-tabs';
import {PlayerPageHeaderGradient} from '@app/web-player/layout/player-page-header-gradient';
import {PlayerPageSuspense} from '@app/web-player/layout/player-page-suspsense';
import {AdHost} from '@common/admin/ads/ad-host';
import {PageMetaTags} from '@common/http/page-meta-tags';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {useSuspenseQuery} from '@tanstack/react-query';

export function Component() {
  return (
    <PlayerPageSuspense>
      <ArtistPage />
    </PlayerPageSuspense>
  );
}

function ArtistPage() {
  const {artistId} = useRequiredParams(['artistId']);
  const query = useSuspenseQuery(
    appQueries.artists.show(artistId).artist('artistPage'),
  );

  return (
    <>
      <PageMetaTags query={query} />
      {query.data.artist.image_small && (
        <PlayerPageHeaderGradient image={query.data.artist.image_small} />
      )}
      <div className="relative">
        <AdHost slot="general_top" className="mb-34" />
        <ArtistPageHeader artist={query.data.artist} />
        <AdHost slot="artist_top" className="mt-14" />
        <ArtistPageTabs data={query.data} />
        <AdHost slot="general_bottom" className="mt-34" />
      </div>
    </>
  );
}
