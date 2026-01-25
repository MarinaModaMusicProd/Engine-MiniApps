import {billingQueries} from '@common/billing/billing-queries';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {EditIcon} from '@ui/icons/material/Edit';
import {SvgImage} from '@ui/images/svg-image';
import {Fragment} from 'react';
import {Link} from 'react-router';
import {BillingPlanPanel} from '../billing-plan-panel';
import paypalSvg from './paypal.svg';

export function PaymentMethodPanel() {
  const query = useSuspenseQuery(billingQueries.user());

  const isPaypal = query.data.subscription.gateway_name === 'paypal';
  const PaymentMethod = isPaypal ? PaypalPaymentMethod : CardPaymentMethod;

  return (
    <BillingPlanPanel title={<Trans message="Payment method" />}>
      <PaymentMethod
        methodClassName="whitespace-nowrap text-base max-w-[464px] flex items-center gap-10"
        linkClassName="flex items-center gap-4 text-muted mt-18 block hover:underline"
      />
    </BillingPlanPanel>
  );
}

interface PaymentMethodProps {
  methodClassName: string;
  linkClassName: string;
}
function CardPaymentMethod({
  methodClassName,
  linkClassName,
}: PaymentMethodProps) {
  const query = useSuspenseQuery(billingQueries.user());
  const user = query.data.user;
  return (
    <Fragment>
      <div className={methodClassName}>
        <span className="capitalize">{query.data.user.card_brand}</span> ••••
        {user.card_last_four}
        {user.card_expires && (
          <div className="ml-auto">
            <Trans message="Expires :date" values={{date: user.card_expires}} />
          </div>
        )}
      </div>
      <Link className={linkClassName} to="/billing/change-payment-method">
        <EditIcon size="sm" />
        <Trans message="Change payment method" />
      </Link>
    </Fragment>
  );
}

function PaypalPaymentMethod({
  methodClassName,
  linkClassName,
}: PaymentMethodProps) {
  const query = useSuspenseQuery(billingQueries.user());
  return (
    <Fragment>
      <div className={methodClassName}>
        <SvgImage src={paypalSvg} />
      </div>
      <a
        className={linkClassName}
        href={`https://www.sandbox.paypal.com/myaccount/autopay/connect/${query.data.subscription.gateway_id}/funding`}
        target="_blank"
        rel="noreferrer"
      >
        <EditIcon size="sm" />
        <Trans message="Change payment method" />
      </a>
    </Fragment>
  );
}
