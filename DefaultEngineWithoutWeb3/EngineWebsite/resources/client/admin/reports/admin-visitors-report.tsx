import React from 'react';
import {useOutletContext} from 'react-router';
import {AdminReportOutletContext} from '@app/admin/reports/marinamoda-admin-report-page';
import {VisitorsReportCharts} from '@common/admin/analytics/visitors-report-charts';
import {useAdminReport} from '@common/admin/analytics/use-admin-report';

export function AdminVisitorsReport() {
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
