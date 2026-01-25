import {InsightsReportCharts} from '@app/admin/reports/insights-report-charts';
import {appQueries} from '@app/app-queries';
import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {ArtistLink} from '@app/web-player/artists/artist-link';
import {BackstageInsightsLayout} from '@app/web-player/backstage/insights/backstage-insights-layout';
import {BackstageInsightsTitle} from '@app/web-player/backstage/insights/backstage-insights-title';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {useQuery} from '@tanstack/react-query';

interface Props {
  isNested?: boolean;
}
export function BackstageArtistInsights({isNested}: Props) {
  const {artistId} = useRequiredParams(['artistId']);
  const {data} = useQuery(appQueries.artists.show(artistId).artist('artist'));
  return (
    <BackstageInsightsLayout
      isNested={isNested}
      reportModel={`artist=${artistId}`}
      title={
        data?.artist && (
          <BackstageInsightsTitle
            image={<SmallArtistImage artist={data.artist} />}
            name={<ArtistLink artist={data.artist} />}
          />
        )
      }
    >
      <InsightsReportCharts showTracks />
    </BackstageInsightsLayout>
  );
}

export function NestedBackstageArtistInsights() {
  return <BackstageArtistInsights isNested />;
}
