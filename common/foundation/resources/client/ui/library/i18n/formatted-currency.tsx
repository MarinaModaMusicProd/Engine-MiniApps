import {useNumberFormatter} from '@ui/i18n/use-number-formatter';
import {Fragment, memo} from 'react';

interface FormattedCurrencyProps {
  value?: number;
  valueInCents?: number;
  currency: string;
}
export const FormattedCurrency = memo(
  ({value, valueInCents, currency}: FormattedCurrencyProps) => {
    const formatter = useNumberFormatter({
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    });

    let finalValue = valueInCents
      ? centsToMain(valueInCents, formatter)
      : value;

    if (finalValue == null || isNaN(finalValue)) {
      finalValue = 0;
    }

    return <Fragment>{formatter.format(finalValue)}</Fragment>;
  },
);

function centsToMain(cents: number, formatter: Intl.NumberFormat): number {
  const {minimumFractionDigits} = formatter.resolvedOptions();
  const divisor = Math.pow(10, minimumFractionDigits ?? 2);
  return cents / divisor;
}
