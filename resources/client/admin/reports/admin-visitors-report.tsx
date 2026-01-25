import {AdminReportOutletContext} from '@app/admin/reports/MarinaModa-admin-report-page';
import {useAdminReport} from '@common/admin/analytics/use-admin-report';
import {VisitorsReportCharts} from '@common/admin/analytics/visitors-report-charts';
import {useOutletContext} from 'react-router';

export function Component() {
  const {dateRange} = useOutletContext<AdminReportOutletContext>();
  const {data, isLoading, isPlaceholderData} = useAdminReport({
    types: ['visitors'],
    dateRange: dateRange,
  });
  return (
    <div className="chart-grid">
      <VisitorsReportCharts
        isLoading={isLoading || isPlaceholderData}
        report={data?.visitorsReport}
      />
    </div>
  );
}
