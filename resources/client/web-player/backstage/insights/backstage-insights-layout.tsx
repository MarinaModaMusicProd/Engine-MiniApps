import {InsightsReportChartsProps} from '@app/admin/reports/insights-report-charts';
import {ReportDateSelector} from '@common/admin/analytics/report-date-selector';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {DateRangeValue} from '@ui/forms/input-field/date/date-range-picker/date-range-value';
import {DateRangePresets} from '@ui/forms/input-field/date/date-range-picker/dialog/date-range-presets';
import {Trans} from '@ui/i18n/trans';
import {Skeleton} from '@ui/skeleton/skeleton';
import clsx from 'clsx';
import {cloneElement, Fragment, ReactElement, useState} from 'react';

interface Props {
  children: ReactElement<InsightsReportChartsProps>;
  reportModel: string;
  title?: ReactElement;
  isNested?: boolean;
}
export function BackstageInsightsLayout({
  children,
  reportModel,
  title,
  isNested,
}: Props) {
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => {
    // This week
    return DateRangePresets[2].getRangeValue();
  });
  return (
    <Fragment>
      <StaticPageTitle>
        <Trans message="Insights" />
      </StaticPageTitle>
      <div className={clsx('flex flex-col', isNested ? 'h-full' : 'h-screen')}>
        {!isNested && (
          <Navbar className="flex-shrink-0" color="bg" darkModeColor="bg" />
        )}
        <div className="flex items-center justify-between gap-8 border-b px-12 py-12 md:px-20">
          {title ? (
            title
          ) : (
            <div className="flex min-h-44 w-320 items-center gap-10">
              <Skeleton variant="avatar" size="w-44 h-44" />
              <div className="flex-auto">
                <Skeleton />
                <Skeleton />
              </div>
            </div>
          )}
          <ReportDateSelector value={dateRange} onChange={setDateRange} />
        </div>
        <div className="relative flex-auto overflow-y-auto bg-cover p-12 md:p-24">
          <div className="mx-auto min-h-full max-w-[1600px] overflow-x-hidden">
            {cloneElement(children, {dateRange, model: reportModel})}
          </div>
        </div>
      </div>
    </Fragment>
  );
}
