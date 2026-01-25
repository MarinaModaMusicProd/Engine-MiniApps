import {billingQueries} from '@common/billing/billing-queries';
import {FormattedPrice} from '@common/billing/formatted-price';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Button} from '@ui/buttons/button';
import {Chip} from '@ui/forms/input-field/chip-field/chip';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {Trans} from '@ui/i18n/trans';
import {CalendarTodayIcon} from '@ui/icons/material/CalendarToday';
import {Link} from 'react-router';
import {BillingPlanPanel} from '../billing-plan-panel';

export function CancelledPlanPanel() {
  const query = useSuspenseQuery(billingQueries.user());

  const endingDate = (
    <span className="whitespace-nowrap">
      <FormattedDate preset="long" date={query.data.subscription.ends_at} />
    </span>
  );

  return (
    <BillingPlanPanel title={<Trans message="Current plan" />}>
      <div className="mt-24 flex flex-col justify-between gap-20">
        <div>
          <Chip
            className="mb-10 w-min"
            size="xs"
            radius="rounded"
            color="danger"
          >
            <Trans message="Canceled" />
          </Chip>
          <div className="mb-2 text-xl font-bold">
            {query.data.subscription.product.name}
          </div>
          <FormattedPrice
            className="mb-8 text-xl"
            price={query.data.subscription.price}
          />
          <div className="flex items-center gap-8 text-base">
            <CalendarTodayIcon size="sm" className="text-muted" />
            <div className="flex-auto">
              {query.data.subscription.on_trial ? (
                <Trans
                  message="Trial will end on :date and you will not be charged."
                  values={{date: endingDate}}
                />
              ) : (
                <Trans
                  message="Your plan will be canceled on :date"
                  values={{date: endingDate}}
                />
              )}
            </div>
          </div>
        </div>
        <div className="w-[233px]">
          <Button
            variant="flat"
            color="primary"
            size="md"
            className="mb-12 w-full"
            elementType={Link}
            to="/billing/renew"
          >
            <Trans message="Renew plan" />
          </Button>
        </div>
      </div>
    </BillingPlanPanel>
  );
}
