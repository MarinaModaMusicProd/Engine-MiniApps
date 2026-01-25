import {billingQueries} from '@common/billing/billing-queries';
import {SectionHelper} from '@common/ui/other/section-helper';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';

type Props = {
  className?: string;
};
export function ActiveTrialBanner({className}: Props) {
  const query = useSuspenseQuery(billingQueries.user());
  if (!query.data.subscription.on_trial) {
    return null;
  }

  const daysLeft = Math.ceil(
    (new Date(query.data.subscription.trial_ends_at).getTime() -
      new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );
  if (daysLeft <= 0) {
    return null;
  }

  return (
    <SectionHelper
      className={className}
      color="positive"
      title={
        <Trans
          message="You have <b>:daysLeft days left</b> in your free trial."
          values={{daysLeft, b: chunks => <b>{chunks}</b>}}
        />
      }
    />
  );
}
