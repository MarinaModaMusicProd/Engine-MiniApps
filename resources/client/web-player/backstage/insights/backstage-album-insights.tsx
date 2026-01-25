import {InsightsReportCharts} from '@app/admin/reports/insights-report-charts';
import {appQueries} from '@app/app-queries';
import {AlbumImage} from '@app/web-player/albums/album-image/album-image';
import {AlbumLink} from '@app/web-player/albums/album-link';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {BackstageInsightsLayout} from '@app/web-player/backstage/insights/backstage-insights-layout';
import {BackstageInsightsTitle} from '@app/web-player/backstage/insights/backstage-insights-title';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {useQuery} from '@tanstack/react-query';

interface Props {
  isNested?: boolean;
}
export function BackstageAlbumInsights({isNested}: Props) {
  const {albumId} = useRequiredParams(['albumId']);
  const {data} = useQuery(appQueries.albums.get(albumId!, 'album'));
  return (
    <BackstageInsightsLayout
      reportModel={`album=${albumId}`}
      title={
        data?.album && (
          <BackstageInsightsTitle
            image={<AlbumImage size="w-38 h-38" album={data.album} />}
            name={<AlbumLink album={data.album} />}
            description={<ArtistLinks artists={data.album.artists} />}
          />
        )
      }
      isNested={isNested}
    >
      <InsightsReportCharts showTracks />
    </BackstageInsightsLayout>
  );
}

export function NestedBackstageAlbumInsights() {
  return <BackstageAlbumInsights isNested />;
}
