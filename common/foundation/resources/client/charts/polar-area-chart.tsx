import {useSelectedLocale} from '@ui/i18n/selected-locale';
import {ChartData, ChartOptions} from 'chart.js';
import {useMemo} from 'react';
import {DatasetItem, ReportMetric} from '../admin/analytics/report-metric';
import {BaseChart, BaseChartProps} from './base-chart';
import {ChartColors} from './chart-colors';
import {formatReportData} from './data/format-report-data';
import {FormattedDatasetItem} from './data/formatted-dataset-item';

const PolarAreaChartOptions: ChartOptions<'polarArea'> = {
  parsing: {
    key: 'value',
  },
  plugins: {
    tooltip: {
      intersect: true,
    },
  },
};

interface PolarAreaChartProps extends Omit<
  BaseChartProps<'polarArea'>,
  'type' | 'data'
> {
  data?: ReportMetric<DatasetItem>;
}
export function PolarAreaChart({
  data,
  datasetLabel,
  className,
  ...props
}: PolarAreaChartProps) {
  const {localeCode} = useSelectedLocale();
  const formattedData: ChartData<'polarArea', FormattedDatasetItem[]> =
    useMemo(() => {
      const formattedData = formatReportData(data, {localeCode});
      formattedData.labels = formattedData.datasets[0]?.data.map(d => d.label);
      formattedData.datasets = formattedData.datasets.map((dataset, i) => ({
        ...dataset,
        label: datasetLabel ?? dataset.label,
        backgroundColor: ChartColors.map(c => c[1]),
        borderColor: ChartColors.map(c => c[0]),
        borderWidth: 2,
      }));
      return formattedData;
    }, [data, localeCode]);

  return (
    <BaseChart
      type="polarArea"
      data={formattedData}
      options={PolarAreaChartOptions}
      className={className}
      {...props}
    />
  );
}
