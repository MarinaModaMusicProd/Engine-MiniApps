import {InputSize} from '@ui/forms/input-field/input-size';
import {useNumberFormatter} from '@ui/i18n/use-number-formatter';
import {clamp} from '@ui/utils/number/clamp';
import clsx from 'clsx';
import {CSSProperties, ReactNode, useId} from 'react';

export interface ProgressBarBaseProps {
  value?: number;
  minValue?: number;
  maxValue?: number;
  className?: string;
  showValueLabel?: boolean;
  valueLabel?: ReactNode;
  size?: 'xs' | 'sm' | 'md';
  labelPosition?: 'top' | 'bottom';
  isIndeterminate?: boolean;
  label?: ReactNode;
  formatOptions?: Intl.NumberFormatOptions;
  role?: string;
  radius?: string;
  trackColor?: string;
  trackHeight?: string;
  progressColor?: string;
}

export function ProgressBarBase(props: ProgressBarBaseProps) {
  let {
    value = 0,
    minValue = 0,
    maxValue = 100,
    size = 'md',
    label,
    showValueLabel = !!label,
    valueLabel: customValueLabel,
    isIndeterminate = false,
    labelPosition = 'top',
    className,
    role,
    formatOptions = {
      style: 'percent',
    },
    radius = 'rounded',
    trackColor = 'bg-primary-light',
    progressColor = 'bg-primary',
    trackHeight = getSize(size),
  } = props;

  const id = useId();

  value = clamp(value, minValue, maxValue);

  const percentage = (value - minValue) / (maxValue - minValue);
  const formatter = useNumberFormatter(formatOptions);

  let valueLabel;
  if (customValueLabel && showValueLabel) {
    valueLabel = customValueLabel;
  } else {
    if (!isIndeterminate && showValueLabel) {
      const valueToFormat =
        formatOptions.style === 'percent' ? percentage : value;
      valueLabel = formatter.format(valueToFormat);
    }
  }

  const barStyle: CSSProperties = {};
  if (!isIndeterminate) {
    barStyle.width = `${Math.round(percentage * 100)}%`;
  }

  const labelEl = (label || valueLabel) && (
    <div className={clsx('my-6 flex justify-between gap-10')}>
      {label && (
        <div
          id={id}
          className="overflow-hidden overflow-ellipsis whitespace-nowrap"
        >
          {label}
        </div>
      )}
      {valueLabel && (
        <div className="overflow-hidden overflow-ellipsis whitespace-nowrap">
          {valueLabel}
        </div>
      )}
    </div>
  );

  return (
    <div
      aria-valuenow={isIndeterminate ? undefined : value}
      aria-valuemin={minValue}
      aria-valuemax={maxValue}
      aria-valuetext={isIndeterminate ? undefined : (valueLabel as string)}
      aria-labelledby={label ? id : undefined}
      role={role || 'progressbar'}
      className={clsx(className, 'min-w-42')}
    >
      {labelPosition === 'top' && labelEl}
      <div className={`${trackHeight} ${radius} ${trackColor} overflow-hidden`}>
        <div
          className={clsx(
            progressColor,
            'fill h-full rounded-l transition-width duration-200',
            isIndeterminate && 'progress-bar-indeterminate-animate',
          )}
          style={barStyle}
        />
      </div>
      {labelPosition === 'bottom' && labelEl}
    </div>
  );
}

function getSize(size: InputSize) {
  switch (size) {
    case 'sm':
      return 'h-6';
    case 'xs':
      return 'h-4';
    default:
      return 'h-8';
  }
}

function getLabelFontSize(size: InputSize) {
  switch (size) {
    case 'lg':
      return 'text-md';
    case 'xs':
      return 'text-xs';
    case '2xs':
      return 'text-xs';
    default:
      return 'text-sm';
  }
}
