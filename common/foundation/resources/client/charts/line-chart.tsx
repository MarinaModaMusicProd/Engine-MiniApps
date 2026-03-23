import {useSelectedLocale} from '@ui/i18n/selected-locale';
import {ChartData, ChartOptions} from 'chart.js';
import {useMemo} from 'react';
import {DatasetItem, ReportMetric} from '../admin/analytics/report-metric';
import {BaseChart, BaseChartProps} from './base-chart';
import {ChartColors} from './chart-colors';
import {formatReportData} from './data/format-report-data';
import {FormattedDatasetItem} from './data/formatted-dataset-item';

const LineChartOptions: ChartOptions<'line'> = {
  parsing: {
    xAxisKey: 'label',
    yAxisKey: 'value',
  },
  datasets: {
    line: {
      fill: 'origin',
      tension: 0.1,
      pointBorderWidth: 4,
      pointHitRadius: 10,
    },
  },
  plugins: {
    tooltip: {
      intersect: false,
      mode: 'index',
    },
  },
};

interface LineChartProps extends Omit<BaseChartProps<'line'>, 'type' | 'data'> {
  data?: ReportMetric<DatasetItem>;
  datasetLabel?: string;
}
export function LineChart({data, datasetLabel, ...props}: LineChartProps) {
  const {localeCode} = useSelectedLocale();
  const formattedData: ChartData<'line', FormattedDatasetItem[]> =
    useMemo(() => {
      const formattedData = formatReportData(data, {localeCode});
      formattedData.datasets = formattedData.datasets.map((dataset, i) => ({
        ...dataset,
        label: datasetLabel ?? dataset.label,
        backgroundColor: ChartColors[i][1],
        borderColor: ChartColors[i][0],
        pointBackgroundColor: ChartColors[i][0],
      }));
      return formattedData;
    }, [data, localeCode]);

  return (
    <BaseChart
      {...props}
      data={formattedData}
      type="line"
      options={LineChartOptions}
    />
  );
}
