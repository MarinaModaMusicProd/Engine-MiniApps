import {
  FetchInsightsReportResponse,
  InsightsReportMetric,
  useInsightsReport,
} from '@app/admin/reports/requests/use-insights-report';
import {TopModelsChartLayout} from '@app/admin/reports/top-models-chart-layout';
import {GeoChart} from '@common/admin/analytics/geo-chart/geo-chart';
import {BaseChartProps} from '@common/charts/base-chart';
import {LineChart} from '@common/charts/line-chart';
import {PolarAreaChart} from '@common/charts/polar-area-chart';
import {UseQueryResult} from '@tanstack/react-query';
import {DateRangeValue} from '@ui/forms/input-field/date/date-range-picker/date-range-value';
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {Trans} from '@ui/i18n/trans';
import {
  cloneElement,
  Fragment,
  ReactElement,
  useCallback,
  useRef,
  useState,
} from 'react';

export interface InsightsReportChartsProps {
  showTracks?: boolean;
  showArtistsAndAlbums?: boolean;
  dateRange?: DateRangeValue;
  model?: string;
}
export function InsightsReportCharts(props: InsightsReportChartsProps) {
  // will be set via "cloneElement"
  const model = props.model as string;
  const dateRange = props.dateRange as DateRangeValue;

  return (
    <div className="chart-grid">
      <AsyncChart metric="plays" model={model} dateRange={dateRange}>
        {({data}) => (
          <LineChart
            colSpan="col-span-8"
            title={<Trans message="Plays" />}
            hideLegend
            description={
              <Trans
                message=":count total plays"
                values={{
                  count: (
                    <FormattedNumber value={data?.report.plays.total || 0} />
                  ),
                }}
              />
            }
          />
        )}
      </AsyncChart>
      <AsyncChart metric="devices" model={model} dateRange={dateRange}>
        <PolarAreaChart
          colSpan="col-span-4"
          title={<Trans message="Top devices" />}
        />
      </AsyncChart>
      {props.showTracks && (
        <AsyncChart metric="tracks" model={model} dateRange={dateRange}>
          <TopModelsChartLayout
            title={<Trans message="Most played tracks" />}
          />
        </AsyncChart>
      )}
      <AsyncChart metric="users" model={model} dateRange={dateRange}>
        <TopModelsChartLayout title={<Trans message="Top listeners" />} />
      </AsyncChart>
      {props.showArtistsAndAlbums && (
        <Fragment>
          <AsyncChart metric="artists" model={model} dateRange={dateRange}>
            <TopModelsChartLayout
              title={<Trans message="Most played artists" />}
            />
          </AsyncChart>
          <AsyncChart metric="albums" model={model} dateRange={dateRange}>
            <TopModelsChartLayout
              title={<Trans message="Most played albums" />}
            />
          </AsyncChart>
        </Fragment>
      )}
      <AsyncChart metric="locations" model={model} dateRange={dateRange}>
        <GeoChart />
      </AsyncChart>
      <AsyncChart metric="platforms" model={model} dateRange={dateRange}>
        <PolarAreaChart
          colSpan="col-span-5"
          title={<Trans message="Top platforms" />}
        />
      </AsyncChart>
    </div>
  );
}

interface AsyncChartProps {
  children:
    | ReactElement<BaseChartProps>
    | ((
        query: UseQueryResult<FetchInsightsReportResponse>,
      ) => ReactElement<BaseChartProps>);
  metric: InsightsReportMetric;
  model: string;
  dateRange: DateRangeValue;
}
function AsyncChart({children, metric, model, dateRange}: AsyncChartProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const query = useInsightsReport(
    {metrics: [metric], model, dateRange},
    {isEnabled},
  );
  const chart = typeof children === 'function' ? children(query) : children;
  const observerRef = useRef<IntersectionObserver>(null);

  const contentRef = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      const observer = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            setIsEnabled(true);
            observerRef.current?.disconnect();
            observerRef.current = null;
          }
        },
        {threshold: 0.1}, // if only header is visible, don't load
      );
      observerRef.current = observer;
      observer.observe(el);
    } else if (observerRef.current) {
      observerRef.current?.disconnect();
    }
  }, []);

  return cloneElement<BaseChartProps>(chart, {
    data: query.data?.report?.[metric],
    isLoading: query.isLoading,
    contentRef,
  });
}
