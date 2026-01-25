import {BillingPageUserResponse} from '@common/billing/billing-page/billin-page-user-response';
import {billingQueries} from '@common/billing/billing-queries';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Chip} from '@ui/forms/input-field/chip-field/chip';
import {FormattedCurrency} from '@ui/i18n/formatted-currency';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {Trans} from '@ui/i18n/trans';
import {OpenInNewIcon} from '@ui/icons/material/OpenInNew';
import {useSettings} from '@ui/settings/use-settings';
import {Invoice} from '../../invoice';
import {BillingPlanPanel} from '../billing-plan-panel';

export function InvoiceHistoryPanel() {
  const query = useSuspenseQuery(billingQueries.user());

  return (
    <BillingPlanPanel title={<Trans message="Invoices" />}>
      <div className="max-w-[464px]">
        <InvoiceList data={query.data} />
      </div>
    </BillingPlanPanel>
  );
}

interface InvoiceListProps {
  data: BillingPageUserResponse;
}
function InvoiceList({data}: InvoiceListProps) {
  const {base_url} = useSettings();
  return (
    <div>
      {!data.invoices.length ? (
        <div className="italic text-muted">
          <Trans message="No invoices yet" />
        </div>
      ) : undefined}
      {data.invoices.map(invoice => (
        <div
          className="mb-14 flex items-center justify-between gap-10 whitespace-nowrap text-base"
          key={invoice.id}
        >
          <a
            href={`${base_url}/billing/invoices/${invoice.uuid}`}
            target="_blank"
            className="flex items-center gap-8 hover:underline"
            rel="noreferrer"
          >
            <FormattedDate date={invoice.created_at} />
            <OpenInNewIcon size="xs" />
          </a>
          <AmountPaid invoice={invoice} />
          <Chip
            size="xs"
            color={invoice.status === 'paid' ? 'positive' : 'danger'}
            radius="rounded"
          >
            {invoice.status === 'paid' ? (
              <Trans message="Paid" />
            ) : (
              <Trans message="Unpaid" />
            )}
          </Chip>
          <div>{data.subscription.product.name}</div>
        </div>
      ))}
    </div>
  );
}

type AmountPaidProps = {
  invoice: Invoice;
};
function AmountPaid({invoice}: AmountPaidProps) {
  const currency =
    invoice.currency || invoice.subscription.price?.currency || 'USD';
  if (invoice.amount_paid != null) {
    return (
      <FormattedCurrency
        valueInCents={invoice.amount_paid}
        currency={currency}
      />
    );
  }

  if (invoice.subscription.price) {
    return (
      <FormattedCurrency
        value={invoice.subscription.price.amount}
        currency={currency}
      />
    );
  }

  return null;
}
