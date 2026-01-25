import {auth} from '@common/auth/use-auth';
import {billingQueries} from '@common/billing/billing-queries';
import {queryClient} from '@common/http/query-client';
import {redirect, RouteObject} from 'react-router';

export const billingPageRoutes: RouteObject[] = [
  {
    path: 'pricing',
    lazy: () => import('@common/billing/pricing-table/pricing-page'),
    loader: () =>
      queryClient.ensureQueryData(billingQueries.products.index('pricingPage')),
  },
  {
    path: 'billing',
    loader: () => {
      if (!auth.isSubscribed) {
        return redirect('/pricing');
      }
      return queryClient.ensureQueryData(billingQueries.user());
    },
    lazy: () => import('@common/billing/billing-page/billing-page-layout'),
    children: [
      {
        index: true,
        lazy: () => import('@common/billing/billing-page/billing-page'),
      },
      {
        path: 'change-payment-method',
        lazy: () =>
          import('@common/billing/billing-page/change-payment-method/change-payment-method-layout'),
        loader: () =>
          queryClient.ensureQueryData(billingQueries.products.index()),
        children: [
          {
            index: true,
            lazy: () =>
              import('@common/billing/billing-page/change-payment-method/change-payment-method-page'),
          },
          {
            path: 'done',
            lazy: () =>
              import('@common/billing/billing-page/change-payment-method/change-payment-method-done'),
          },
        ],
      },
      {
        path: 'change-plan',
        lazy: () => import('@common/billing/billing-page/change-plan-page'),
        loader: () =>
          queryClient.ensureQueryData(billingQueries.products.index()),
      },
      {
        path: 'change-plan/:productId/:priceId/confirm',
        lazy: () =>
          import('@common/billing/billing-page/confirm-plan-change-page'),
      },
      {
        path: 'cancel',
        lazy: () =>
          import('@common/billing/billing-page/confirm-plan-cancellation-page'),
      },
      {
        path: 'renew',
        lazy: () =>
          import('@common/billing/billing-page/confirm-plan-renewal-page'),
      },
    ],
  },
];
