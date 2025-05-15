import {ChartLayout} from '@common/charts/chart-layout';
import {Table} from '@common/ui/tables/table';
import React, {Fragment, ReactNode, useMemo} from 'react';
import {TableDataItem} from '@common/ui/tables/types/table-data-item';
import {ReportMetric} from '@common/admin/analytics/report-metric';
import {nanoid} from 'nanoid';
import {ColumnConfig} from '@common/datatable/column-config';
import {Skeleton} from '@ui/skeleton/skeleton';
import clsx from 'clsx';
import {ArrowDropDownIcon} from '@ui/icons/material/ArrowDropDown';
import {ArrowDropUpIcon} from '@ui/icons/material/ArrowDropUp';
import {FormattedDuration} from '@ui/i18n/formatted-duration';
import {IllustratedMessage} from '@ui/images/illustrated-message';
import {Trans} from '@ui/i18n/trans';
import {ChartIcon} from '@common/charts/chart-icon';
import {FormattedNumber} from '@ui/i18n/formatted-number';

export interface ReportTableItem<T extends TableDataItem> {
  id: number;
  data: T;
  compareData?: T;
}

function useFormattedReportTableData<T extends TableDataItem>(
  report?: ReportMetric<T>,
  data?: T[],
): ReportTableItem<T>[] | null {
  return useMemo(() => {
    if (report) {
      const formattedData = [];
      for (let i = 0; i < report.datasets[0].data.length; i++) {
        formattedData.push({
          id: i,
          data: report.datasets[0].data[i],
          compareData: report.datasets[1]?.data[i],
        });
      }
      return formattedData;
    }
    if (data) {
      return data.map(item => ({
        id: item.id as number,
        data: item,
      }));
    }
    return null;
  }, [report, data]);
}

interface ReportTableProps {
  report?: ReportMetric<any>;
  data?: any[];
  columns: ColumnConfig<any>[];
  cellHeight?: string;
  skeletonCount?: number;
}
export function ReportTable<T extends TableDataItem>({
  report,
  data,
  columns,
  cellHeight = 'h-54',
  skeletonCount = 3,
}: ReportTableProps) {
  const formattedData = useFormattedReportTableData<T>(report, data);
  const isEmpty = formattedData && formattedData.length === 0;

  const placeholderRows = useMemo(() => {
    return Array.from({length: skeletonCount}).map(() => ({
      id: nanoid(),
      isPlaceholder: true,
    })) as unknown as any[];
  }, [skeletonCount]);

  return (
    <Fragment>
      <Table
        columns={columns}
        data={!isEmpty && !formattedData ? placeholderRows : formattedData}
        enableSelection={false}
        collapseOnMobile={false}
        cellHeight={cellHeight}
      />
      {isEmpty && (
        <IllustratedMessage
          image={<ChartIcon size="lg" />}
          className="mb-40 mt-80"
          imageMargin="mb-10"
          imageHeight="h-40"
          title={<Trans message="This report has no data" />}
          description={
            <Trans message="To see data here, try changing report date range" />
          }
        />
      )}
    </Fragment>
  );
}

interface ChartGridReportTableProps {
  label: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}
export function ChartGridReportTable({
  label,
  actions,
  children,
}: ChartGridReportTableProps) {
  return (
    <ChartLayout
      title={label}
      description={actions}
      className="compact-scrollbar row-span-11 col-span-12 overflow-auto"
      contentIsFlex={false}
    >
      {children}
    </ChartLayout>
  );
}

interface ReportTableCellProps<T extends TableDataItem> {
  item: ReportTableItem<T>;
  name: keyof T;
  type?: 'number' | 'percent' | 'duration';
  compareValueType?: 'number' | 'percent';
  compareType?: 'biggerIsBetter' | 'smallerIsBetter';
  isPlaceholder: boolean | undefined;
  skeletonMaxWidth?: string;
}
export function ReportTableCell<T extends TableDataItem>({
  item,
  name,
  type = 'number',
  compareValueType,
  compareType,
  isPlaceholder,
  skeletonMaxWidth = 'max-w-30',
}: ReportTableCellProps<T>) {
  if (isPlaceholder) {
    return <Skeleton className={skeletonMaxWidth} />;
  }

  compareValueType =
    compareValueType ?? (type === 'number' ? 'number' : 'percent');

  const value = item.data[name] as number | string | null;
  const compareValue = (item.compareData ? item.compareData[name] : null) as
    | number
    | string
    | null;

  if (value === null || (type === 'duration' && value === 0)) {
    return null;
  }

  return (
    <span className="flex items-center">
      <span className={compareValue ? 'pr-6' : ''}>
        <CellValue value={value} type={type} />
      </span>
      {compareValue != null ? (
        <ReportTableCompareValue
          valueType={compareValueType}
          type={compareType}
          currentValue={value}
          previousValue={compareValue}
        />
      ) : null}
    </span>
  );
}

interface CellValueProps {
  value: number | string | null;
  type: 'number' | 'percent' | 'duration';
}
function CellValue({value, type}: CellValueProps) {
  if (value === null) return null;

  switch (type) {
    case 'number':
      return <FormattedNumber value={+value} />;
    case 'percent':
      return `${value}%`;
    case 'duration':
      return <FormattedDuration seconds={value as number} verbose />;
  }
}

interface CompareValueProps {
  currentValue: number | string;
  previousValue: number | string;
  valueType: 'number' | 'percent';
  type?: 'biggerIsBetter' | 'smallerIsBetter';
}
function ReportTableCompareValue({
  currentValue,
  previousValue,
  type = 'biggerIsBetter',
  valueType,
}: CompareValueProps) {
  const value =
    valueType === 'percent'
      ? calculatePercentage(+currentValue, +previousValue)
      : +currentValue - +previousValue;

  const isPositiveGood = type === 'biggerIsBetter';

  return (
    <Fragment>
      {value > 0 ? (
        <ArrowDropUpIcon
          className={clsx(isPositiveGood ? 'text-positive' : 'text-danger')}
          size="sm"
        />
      ) : null}
      {value < 0 ? (
        <ArrowDropDownIcon
          className={clsx(isPositiveGood ? 'text-danger' : 'text-positive')}
          size="sm"
        />
      ) : null}
      {value === 0 ? (
        <span className="w-20 text-center text-muted">&mdash;</span>
      ) : null}
      <span
        className={clsx(
          'font-semibold',
          value > 0 && (isPositiveGood ? 'text-positive' : 'text-danger'),
          value < 0 && (isPositiveGood ? 'text-danger' : 'text-positive'),
          value === 0 && 'text-muted',
        )}
      >
        {Math.abs(value)}
        {valueType === 'percent' ? '%' : ''}
      </span>
    </Fragment>
  );
}

function calculatePercentage(currentValue: number, previousValue: number) {
  if (previousValue == null || currentValue == null) {
    return 0;
  }

  if (previousValue === 0) {
    return 100;
  }

  return Math.round(((currentValue - previousValue) / previousValue) * 100);
}
