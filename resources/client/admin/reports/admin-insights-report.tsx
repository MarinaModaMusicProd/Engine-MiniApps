import {AdminReportOutletContext} from '@app/admin/reports/MarinaModa-admin-report-page';
import {InsightsReportCharts} from '@app/admin/reports/insights-report-charts';
import {useOutletContext} from 'react-router';

export function Component() {
  const {dateRange} = useOutletContext<AdminReportOutletContext>();
  return (
    <InsightsReportCharts
      dateRange={dateRange}
      model="track_play=0"
      showTracks
      showArtistsAndAlbums
    />
  );
}
