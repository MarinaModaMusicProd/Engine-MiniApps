import {InsightsReportCharts} from '@app/admin/reports/insights-report-charts';
import {appQueries} from '@app/app-queries';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {BackstageInsightsLayout} from '@app/web-player/backstage/insights/backstage-insights-layout';
import {BackstageInsightsTitle} from '@app/web-player/backstage/insights/backstage-insights-title';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {TrackLink} from '@app/web-player/tracks/track-link';
import {useQuery} from '@tanstack/react-query';
import {useParams} from 'react-router';

interface Props {
  isNested?: boolean;
}
export function BackstageTrackInsights({isNested}: Props) {
  const {trackId} = useParams();
  const {data} = useQuery(appQueries.tracks.get(trackId!, 'track'));
  return (
    <BackstageInsightsLayout
      reportModel={`track=${trackId}`}
      title={
        data?.track && (
          <BackstageInsightsTitle
            image={<TrackImage size="w-38 h-38" track={data.track} />}
            name={<TrackLink track={data.track} />}
            description={<ArtistLinks artists={data.track.artists} />}
          />
        )
      }
      isNested={isNested}
    >
      <InsightsReportCharts />
    </BackstageInsightsLayout>
  );
}

export function NestedBackstageTrackInsights() {
  return <BackstageTrackInsights isNested />;
}
