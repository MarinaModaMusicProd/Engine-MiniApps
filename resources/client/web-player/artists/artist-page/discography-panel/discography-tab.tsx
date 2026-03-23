import {DiscographyGroupedAlbums} from '@app/web-player/artists/artist-page/discography-panel/discography-grouped-albums';
import {NoDiscographyMessage} from '@app/web-player/artists/artist-page/discography-panel/no-discography-message';
import {SimilarArtistsCarousel} from '@app/web-player/artists/artist-page/discography-panel/similar-artists-carousel';
import {TopTracksTable} from '@app/web-player/artists/artist-page/discography-panel/top-tracks-table';
import {GetArtistResponse} from '@app/web-player/artists/requests/get-artist-response';
import {AdHost} from '@common/admin/ads/ad-host';

interface DiscographyTabProps {
  data: GetArtistResponse;
}
export function DiscographyTab({data}: DiscographyTabProps) {
  const {grouped_albums, artist} = data;

  const hasTopTracks = !!data.top_tracks?.length;
  const hasAlbums = grouped_albums && Object.keys(grouped_albums).length > 0;
  const hasSimilarArtists = !!artist.similar?.length;

  if (!hasTopTracks && !hasAlbums && !hasSimilarArtists) {
    return <NoDiscographyMessage />;
  }

  return (
    <div>
      {hasTopTracks ? <TopTracksTable tracks={data.top_tracks} /> : null}
      <AdHost slot="artist_bottom" className="mt-34" />
      <div className="mt-44">
        {hasAlbums && (
          <DiscographyGroupedAlbums groupedAlbums={grouped_albums} />
        )}
        {hasSimilarArtists ? (
          <SimilarArtistsCarousel similarArtists={artist.similar ?? []} />
        ) : null}
      </div>
    </div>
  );
}
