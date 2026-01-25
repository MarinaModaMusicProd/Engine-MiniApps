import {ActiveTrialBanner} from '@common/billing/billing-page/active-trial-banner';
import {billingQueries} from '@common/billing/billing-queries';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Breadcrumb} from '@ui/breadcrumbs/breadcrumb';
import {BreadcrumbItem} from '@ui/breadcrumbs/breadcrumb-item';
import {Button} from '@ui/buttons/button';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {Trans} from '@ui/i18n/trans';
import {Fragment} from 'react';
import {Link, Navigate, useParams} from 'react-router';
import {useNavigate} from '../../ui/navigation/use-navigate';
import {FormattedPrice} from '../formatted-price';
import {BillingPlanPanel} from './billing-plan-panel';
import {useChangeSubscriptionPlan} from './requests/use-change-subscription-plan';

const previousUrl = '/billing/change-plan';

export function Component() {
  const {productId, priceId} = useParams();
  const navigate = useNavigate();
  const productQuery = useSuspenseQuery(billingQueries.products.index());
  const userQuery = useSuspenseQuery(billingQueries.user());
  const changePlan = useChangeSubscriptionPlan();

  if (`${userQuery.data.subscription.price_id}` == priceId) {
    return <Navigate to="/billing/change-plan" replace />;
  }

  const newProduct = productQuery.data.products.find(
    p => `${p.id}` === productId,
  );
  const newPrice = newProduct?.prices.find(p => `${p.id}` === priceId);

  if (!newProduct || !newPrice) {
    navigate(previousUrl);
    return null;
  }

  const newDate = (
    <span className="whitespace-nowrap">
      <FormattedDate
        date={userQuery.data.subscription.renews_at}
        preset="long"
      />
      ;
    </span>
  );

  return (
    <Fragment>
      <Breadcrumb>
        <BreadcrumbItem isLink onSelected={() => navigate('/billing')}>
          <Trans message="Billing" />
        </BreadcrumbItem>
        <BreadcrumbItem onSelected={() => navigate(previousUrl)}>
          <Trans message="Plans" />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Trans message="Confirm" />
        </BreadcrumbItem>
      </Breadcrumb>
      <ActiveTrialBanner className="mb-24" />
      <h1 className="my-32 text-3xl font-bold md:my-64">
        <Trans message="Confirm your new plan" />
      </h1>
      <BillingPlanPanel title={<Trans message="Changing to" />}>
        <div className="max-w-[464px]">
          <div className="text-xl font-bold">{newProduct.name}</div>
          <FormattedPrice price={newPrice} className="text-lg" />
          <div className="mb-48 mt-12 border-b pb-24 text-base">
            <Trans
              message="You will be charged the new price starting :date"
              values={{date: newDate}}
            />
          </div>
          <div>
            <div>
              <Button
                variant="flat"
                color="primary"
                size="md"
                className="mb-16 w-full"
                onClick={() => {
                  changePlan.mutate({
                    subscriptionId: userQuery.data.subscription.id,
                    newProductId: newProduct.id,
                    newPriceId: newPrice.id,
                  });
                }}
                disabled={changePlan.isPending}
              >
                <Trans message="Confirm" />
              </Button>
            </div>
            <div>
              <Button
                variant="outline"
                className="w-full"
                to={previousUrl}
                elementType={Link}
              >
                <Trans message="Go back" />
              </Button>
            </div>
            <div className="mt-12 text-xs text-muted">
              <Trans message="By confirming your new plan, you agree to our terms of Service and privacy policy." />
            </div>
          </div>
        </div>
      </BillingPlanPanel>
    </Fragment>
  );
}
