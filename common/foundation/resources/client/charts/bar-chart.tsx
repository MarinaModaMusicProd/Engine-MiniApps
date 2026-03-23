import {useSelectedLocale} from '@ui/i18n/selected-locale';
import {ChartData, ChartOptions} from 'chart.js';
import {useMemo} from 'react';
import {DatasetItem, ReportMetric} from '../admin/analytics/report-metric';
import {BaseChart, BaseChartProps} from './base-chart';
import {ChartColors} from './chart-colors';
import {formatReportData} from './data/format-report-data';
import {FormattedDatasetItem} from './data/formatted-dataset-item';

interface BarChartProps extends Omit<BaseChartProps<'bar'>, 'type' | 'data'> {
  direction?: 'horizontal' | 'vertical';
  individualBarColors?: boolean;
  data?: ReportMetric<DatasetItem>;
}
export function BarChart({
  data,
  datasetLabel,
  direction = 'vertical',
  individualBarColors = false,
  className,
  ...props
}: BarChartProps) {
  const {localeCode} = useSelectedLocale();
  const formattedData: ChartData<'bar', FormattedDatasetItem[]> =
    useMemo(() => {
      const formattedData = formatReportData(data, {localeCode});
      formattedData.datasets = formattedData.datasets.map((dataset, i) => ({
        ...dataset,
        label: datasetLabel ?? dataset.label,
        backgroundColor: individualBarColors
          ? ChartColors.map(c => c[1])
          : ChartColors[i][1],
        borderColor: individualBarColors
          ? ChartColors.map(c => c[0])
          : ChartColors[i][0],
        borderWidth: 2,
      }));
      return formattedData;
    }, [data, localeCode, individualBarColors]);

  const isHorizontal = direction === 'horizontal';
  const options: ChartOptions<'bar'> = useMemo(() => {
    return {
      indexAxis: isHorizontal ? 'y' : 'x',
      parsing: {
        xAxisKey: isHorizontal ? 'value' : 'label',
        yAxisKey: isHorizontal ? 'label' : 'value',
      },
    };
  }, [isHorizontal]);

  return (
    <BaseChart
      type="bar"
      className={className}
      data={formattedData}
      options={options}
      {...props}
    />
  );
}
