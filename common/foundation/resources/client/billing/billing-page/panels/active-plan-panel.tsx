import {BillingPlanPanel} from '@common/billing/billing-page/billing-plan-panel';
import {billingQueries} from '@common/billing/billing-queries';
import {FormattedPrice} from '@common/billing/formatted-price';
import {Subscription} from '@common/billing/subscription';
import {SectionHelper} from '@common/ui/other/section-helper';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Button} from '@ui/buttons/button';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {Trans} from '@ui/i18n/trans';
import {Fragment, ReactElement} from 'react';
import {Link} from 'react-router';

export function ActivePlanPanel() {
  const query = useSuspenseQuery(billingQueries.user());

  const renewDate = (
    <FormattedDate preset="long" date={query.data.subscription.renews_at} />
  );

  return (
    <Fragment>
      {query.data.subscription.past_due ? <PastDueMessage /> : null}
      <BillingPlanPanel title={<Trans message="Current plan" />}>
        <div className="mt-24 flex justify-between gap-20">
          <div>
            <div className="mb-2 text-xl font-bold">
              {query.data.subscription.product.name}
            </div>
            <FormattedPrice
              className="mb-2 text-xl"
              price={query.data.subscription.price}
            />
            <div className="text-base">
              <RenewMessage
                subscription={query.data.subscription}
                renewDate={renewDate}
              />
            </div>
          </div>
          <div className="w-[233px]">
            <Button
              variant="flat"
              color="primary"
              size="md"
              className="mb-12 w-full"
              elementType={Link}
              to="/billing/change-plan"
              disabled={query.data.subscription.gateway_name === 'none'}
            >
              <Trans message="Change plan" />
            </Button>
            <Button
              variant="outline"
              color="danger"
              size="md"
              className="w-full"
              elementType={Link}
              to="/billing/cancel"
            >
              <Trans message="Cancel plan" />
            </Button>
          </div>
        </div>
      </BillingPlanPanel>
    </Fragment>
  );
}

type RenewMessageProps = {
  subscription: Subscription;
  renewDate: ReactElement;
};
function RenewMessage({subscription, renewDate}: RenewMessageProps) {
  if (subscription.on_trial) {
    return (
      <Trans
        message="You will be automatically charged after your free trial ends on :date."
        values={{date: renewDate}}
      />
    );
  }

  return (
    <Trans message="Your plan renews on :date" values={{date: renewDate}} />
  );
}

function PastDueMessage() {
  return (
    <SectionHelper
      className="mb-24"
      color="danger"
      title="Payment is past due"
      description="Your recent recurring payment has failed with the payment method we have on file. Please update your payment method to avoid any service interruptions."
    />
  );
}
