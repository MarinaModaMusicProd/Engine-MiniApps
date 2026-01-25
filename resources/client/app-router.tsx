import {adminRoutes} from '@app/admin/admin-routes';
import {backstageRoutes} from '@app/web-player/backstage/backstage-routes';
import {webPlayerRoutes} from '@app/web-player/routes/web-player-routes';
import {authRoutes} from '@common/auth/auth-routes';
import {authGuard} from '@common/auth/guards/auth-route';
import {billingPageRoutes} from '@common/billing/billing-page/billing-page-routes';
import {checkoutRoutes} from '@common/billing/checkout/checkout-routes';
import {RootErrorElement, RootRoute} from '@common/core/common-provider';
import {commonRoutes} from '@common/core/common-routes';
import {notificationRoutes} from '@common/notifications/notification-routes';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {FullPageLoader} from '@ui/progress/full-page-loader';
import {createBrowserRouter} from 'react-router';

export const appRouter = createBrowserRouter(
  [
    {
      id: 'root',
      element: <RootRoute />,
      errorElement: <RootErrorElement />,
      hydrateFallbackElement: <FullPageLoader screen />,
      children: [
        ...authRoutes(),
        ...notificationRoutes,
        ...adminRoutes,
        ...checkoutRoutes,
        ...billingPageRoutes,
        ...commonRoutes,
        ...webPlayerRoutes,
        ...backstageRoutes,
        {
          path: 'api-docs',
          loader: () =>
            authGuard({permission: 'api.access', requireLogin: false}),
          lazy: () => import('@common/swagger/swagger-api-docs-page'),
        },
      ],
    },
  ],
  {
    basename: getBootstrapData().settings.html_base_uri,
  },
);
