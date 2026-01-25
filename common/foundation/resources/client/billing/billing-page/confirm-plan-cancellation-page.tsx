import {ActiveTrialBanner} from '@common/billing/billing-page/active-trial-banner';
import {billingQueries} from '@common/billing/billing-queries';
import {queryClient} from '@common/http/query-client';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Breadcrumb} from '@ui/breadcrumbs/breadcrumb';
import {BreadcrumbItem} from '@ui/breadcrumbs/breadcrumb-item';
import {Button} from '@ui/buttons/button';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {Trans} from '@ui/i18n/trans';
import {Fragment} from 'react';
import {Link} from 'react-router';
import {useNavigate} from '../../ui/navigation/use-navigate';
import {FormattedPrice} from '../formatted-price';
import {BillingPlanPanel} from './billing-plan-panel';
import {useCancelSubscription} from './requests/use-cancel-subscription';

const previousUrl = '/billing';

export function Component() {
  const navigate = useNavigate();
  const query = useSuspenseQuery(billingQueries.user());
  const cancelSubscription = useCancelSubscription();

  const product = query.data.subscription.product;
  const price = query.data.subscription.price;

  const renewDate = (
    <span className="whitespace-nowrap">
      <FormattedDate date={query.data.subscription.renews_at} preset="long" />
    </span>
  );

  const handleSubscriptionCancel = () => {
    cancelSubscription.mutate(
      {
        subscriptionId: query.data.subscription.id,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: billingQueries.user().queryKey,
          });
          navigate('/billing');
        },
      },
    );
  };

  return (
    <Fragment>
      <Breadcrumb>
        <BreadcrumbItem isLink onSelected={() => navigate(previousUrl)}>
          <Trans message="Billing" />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Trans message="Cancel" />
        </BreadcrumbItem>
      </Breadcrumb>
      <ActiveTrialBanner className="mb-24" />
      <h1 className="my-32 text-3xl font-bold md:my-64">
        <Trans message="Cancel your plan" />
      </h1>
      <BillingPlanPanel title={<Trans message="Current plan" />}>
        <div className="max-w-[464px]">
          <div className="text-xl font-bold">{product.name}</div>
          <FormattedPrice price={price} className="text-lg" />
          <div className="mb-48 mt-12 border-b pb-24 text-base">
            {query.data.subscription.on_trial ? (
              <Trans
                message="You will not be automatically charged after trial ends, but trial will still be active until :date"
                values={{date: renewDate}}
              />
            ) : (
              <Trans
                message="Your plan will be canceled, but is still available until the end of your billing period on :date"
                values={{date: renewDate}}
              />
            )}
            <div className="mt-20">
              <Trans message="If you change your mind, you can renew your subscription." />
            </div>
          </div>
          <div>
            <div>
              <Button
                variant="flat"
                color="primary"
                size="md"
                className="mb-16 w-full"
                onClick={handleSubscriptionCancel}
                disabled={cancelSubscription.isPending}
              >
                <Trans message="Cancel plan" />
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
              <Trans message="By cancelling your plan, you agree to our terms of service and privacy policy." />
            </div>
          </div>
        </div>
      </BillingPlanPanel>
    </Fragment>
  );
}
