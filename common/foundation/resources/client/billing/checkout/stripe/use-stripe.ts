import {useAuth} from '@common/auth/use-auth';
import {apiClient} from '@common/http/query-client';
import {loadStripe, Stripe, StripeElements} from '@stripe/stripe-js';
import {useSelectedLocale} from '@ui/i18n/selected-locale';
import {useSettings} from '@ui/settings/use-settings';
import {useIsDarkMode} from '@ui/themes/use-is-dark-mode';
import {useEffect, useRef, useState} from 'react';

interface UseStripeProps {
  type: 'createSetupIntent' | 'createSubscription';
  productId?: string | number;
  priceId?: string | number;
}
export function useStripe({type, productId, priceId}: UseStripeProps) {
  const {user} = useAuth();
  const isDarkMode = useIsDarkMode();
  const isInitiatedRef = useRef<boolean>(false);
  const paymentElementRef = useRef<HTMLDivElement>(null);
  const {localeCode} = useSelectedLocale();
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const {
    branding: {site_name},
    billing,
  } = useSettings();

  useEffect(() => {
    if (
      !billing?.stripe?.enable ||
      !billing?.stripe_public_key ||
      isInitiatedRef.current
    )
      return;

    Promise.all([
      // load stripe js library
      loadStripe(billing.stripe_public_key, {
        //apiVersion: '2022-08-01',
        locale: localeCode as any,
      }),
      // create partial subscription for clientSecret
      type === 'createSetupIntent'
        ? createSetupIntent()
        : createSubscription(productId!, priceId),
    ]).then(([stripe, backendResult]) => {
      if (stripe && paymentElementRef.current) {
        const elements = stripe.elements({
          clientSecret: backendResult.clientSecret,
          appearance: {
            theme: isDarkMode ? 'night' : 'stripe',
          },
        });

        // Create and mount the Payment Element
        const paymentElement = elements.create('payment', {
          business: {name: site_name},
          terms: {card: 'never'},
          fields: {
            billingDetails: {
              address: 'auto',
            },
          },
          defaultValues: {
            billingDetails: {
              email: user?.email,
            },
          },
        });
        paymentElement.mount(paymentElementRef.current);

        setStripe(stripe);
        setElements(elements);
        setSubscriptionId(backendResult.subscriptionId ?? null);
      }
    });

    isInitiatedRef.current = true;
  }, [
    productId,
    billing?.stripe_public_key,
    billing?.stripe?.enable,
    isDarkMode,
    localeCode,
    site_name,
    type,
    user?.email,
  ]);

  return {
    stripe,
    elements,
    paymentElementRef,
    stripeIsEnabled:
      billing?.stripe_public_key != null && billing?.stripe?.enable,
    subscriptionId,
  };
}

type BackendResult = {clientSecret: string; subscriptionId?: string};

function createSetupIntent(): Promise<BackendResult> {
  return apiClient.post('billing/stripe/create-setup-intent').then(r => r.data);
}

function createSubscription(
  productId: number | string,
  priceId?: number | string,
): Promise<BackendResult> {
  return apiClient
    .post('billing/stripe/create-partial-subscription', {
      product_id: productId,
      price_id: priceId,
    })
    .then(r => r.data);
}
