import {BillingPageUserResponse} from '@common/billing/billing-page/billin-page-user-response';
import {Product} from '@common/billing/product';
import {PaginatedBackendResponse} from '@common/http/backend-response/pagination-response';
import {queryFactoryHelpers} from '@common/http/queries-file-helpers';
import {queryOptions} from '@tanstack/react-query';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';

export const billingQueries = {
  user: () =>
    queryOptions<BillingPageUserResponse>({
      queryKey: ['users', 'billing', 'me'],
      queryFn: () => queryFactoryHelpers.get('billing/user'),
    }),
  products: {
    invalidateKey: ['billing', 'products'],
    index: (loader?: 'landingPage' | 'pricingPage') => {
      const key = ['billing', 'products', 'index'];
      if (loader) {
        key.push(loader);
      }
      return queryOptions<{products: Product[]}>({
        queryKey: key,
        queryFn: () =>
          queryFactoryHelpers
            .get<PaginatedBackendResponse<Product>>('billing/products')
            .then(r => ({
              products: r.pagination.data,
            })),
        initialData: () => {
          if (loader) {
            // @ts-ignore
            return getBootstrapData().loaders?.[loader];
          }
        },
      });
    },
    get: (productId: number | string) =>
      queryOptions<{product: Product}>({
        queryKey: ['billing', 'products', 'get', productId],
        queryFn: () =>
          queryFactoryHelpers.get<{product: Product}>(
            `billing/products/${productId}`,
          ),
      }),
  },
};
