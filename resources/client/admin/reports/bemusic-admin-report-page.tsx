import {AdminReportCardRow} from '@common/admin/analytics/admin-report-card-row';
import {ReportDateSelector} from '@common/admin/analytics/report-date-selector';
import {useAdminReport} from '@common/admin/analytics/use-admin-report';
import {DatatablePageHeaderBar} from '@common/datatable/page/datatable-page-with-header-layout';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {Button} from '@ui/buttons/button';
import {ButtonGroup} from '@ui/buttons/button-group';
import {DateRangeValue} from '@ui/forms/input-field/date/date-range-picker/date-range-value';
import {DateRangePresets} from '@ui/forms/input-field/date/date-range-picker/dialog/date-range-presets';
import {Trans} from '@ui/i18n/trans';
import {Fragment, useState} from 'react';
import {Link, Outlet, useLocation} from 'react-router';

export interface AdminReportOutletContext {
  dateRange: DateRangeValue;
  setDateRange: (dateRange: DateRangeValue) => void;
}

export function Component() {
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => {
    // This week
    return DateRangePresets[2].getRangeValue();
  });
  const {pathname} = useLocation();
  const channel = pathname.endsWith('visitors') ? 'visitors' : 'plays';

  const title =
    channel === 'visitors' ? (
      <Trans message="Visitors report" />
    ) : (
      <Trans message="Plays report" />
    );

  return (
    <div className="flex h-full flex-col">
      <StaticPageTitle>{title}</StaticPageTitle>
      <DatatablePageHeaderBar
        showSidebarToggleButton
        title={title}
        rightContent={
          <Fragment>
            <ButtonGroup variant="outline" value={channel}>
              <Button value="plays" elementType={Link} to="plays">
                <Trans message="Plays" />
              </Button>
              <Button value="visitors" elementType={Link} to="visitors">
                <Trans message="Visitors" />
              </Button>
            </ButtonGroup>
            <ReportDateSelector value={dateRange} onChange={setDateRange} />
          </Fragment>
        }
      />
      <div className="flex-auto overflow-auto p-12 md:p-24">
        <Header dateRange={dateRange} />
        <Outlet context={{dateRange, setDateRange}} />
      </div>
    </div>
  );
}

interface HeaderProps {
  dateRange: DateRangeValue;
}
function Header({dateRange}: HeaderProps) {
  const {data} = useAdminReport({types: ['header'], dateRange});
  return (
    <div className="chart-grid mb-20">
      <AdminReportCardRow report={data?.headerReport} />
    </div>
  );
}
