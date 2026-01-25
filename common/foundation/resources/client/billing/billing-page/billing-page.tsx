import {ActiveTrialBanner} from '@common/billing/billing-page/active-trial-banner';
import {billingQueries} from '@common/billing/billing-queries';
import {useSuspenseQuery} from '@tanstack/react-query';
import {ActivePlanPanel} from './panels/active-plan-panel';
import {CancelledPlanPanel} from './panels/cancelled-plan-panel';
import {InvoiceHistoryPanel} from './panels/invoice-history-panel';
import {PaymentMethodPanel} from './panels/payment-method-panel';

export function Component() {
  const query = useSuspenseQuery(billingQueries.user());

  const planPanel = query.data.subscription.ends_at ? (
    <CancelledPlanPanel />
  ) : (
    <ActivePlanPanel />
  );

  return (
    <div>
      <ActiveTrialBanner className="mb-44" />
      {planPanel}
      <PaymentMethodPanel />
      <InvoiceHistoryPanel />
    </div>
  );
}
