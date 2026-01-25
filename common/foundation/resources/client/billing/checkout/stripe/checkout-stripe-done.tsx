import {apiClient} from '@common/http/query-client';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {loadStripe, PaymentIntent, SetupIntent} from '@stripe/stripe-js';
import {message} from '@ui/i18n/message';
import {useSettings} from '@ui/settings/use-settings';
import {useEffect, useRef, useState} from 'react';
import {useParams, useSearchParams} from 'react-router';
import {
  BillingRedirectMessage,
  BillingRedirectMessageConfig,
} from '../../billing-redirect-message';
import {CheckoutLayout} from '../checkout-layout';
import {CheckoutProductSummary} from '../checkout-product-summary';

export function Component() {
  const {productId, priceId} = useParams();
  const navigate = useNavigate();
  const {
    billing: {stripe_public_key},
  } = useSettings();

  const [params] = useSearchParams();

  const type = params.get('payment_intent_client_secret')
    ? 'paymentIntent'
    : 'setupIntent';
  const clientSecret =
    type === 'paymentIntent'
      ? params.get('payment_intent_client_secret')
      : params.get('setup_intent_client_secret');
  const subscriptionId = params.get('subscriptionId');

  const [messageConfig, setMessageConfig] =
    useState<BillingRedirectMessageConfig>();

  const stripeInitiated = useRef<boolean>(false);

  useEffect(() => {
    if (stripeInitiated.current) return;
    loadStripe(stripe_public_key!).then(async stripe => {
      if (
        !stripe ||
        !clientSecret ||
        (type === 'setupIntent' && !subscriptionId)
      ) {
        setMessageConfig(getRedirectMessageConfig());
        return;
      }

      const handle = async (
        intent: PaymentIntent | SetupIntent | undefined,
      ) => {
        if (intent?.status === 'succeeded') {
          await storeSubscriptionDetailsLocally(
            type,
            intent.id,
            subscriptionId,
          );
          setMessageConfig(
            getRedirectMessageConfig('succeeded', productId, priceId),
          );
          window.location.href = '/billing';
        } else {
          setMessageConfig(
            getRedirectMessageConfig(intent?.status, productId, priceId),
          );
        }
      };

      if (type === 'paymentIntent') {
        stripe
          .retrievePaymentIntent(clientSecret)
          .then(({paymentIntent}) => handle(paymentIntent));
      } else {
        stripe
          .retrieveSetupIntent(clientSecret)
          .then(({setupIntent}) => handle(setupIntent));
      }
    });
    stripeInitiated.current = true;
  }, [stripe_public_key, clientSecret, priceId, productId]);

  if (!clientSecret) {
    navigate('/');
    return null;
  }

  return (
    <CheckoutLayout>
      <BillingRedirectMessage config={messageConfig} />
      <CheckoutProductSummary showBillingLine={false} />
    </CheckoutLayout>
  );
}

function getRedirectMessageConfig(
  status?: PaymentIntent.Status,
  productId?: string,
  priceId?: string,
): BillingRedirectMessageConfig {
  switch (status) {
    case 'succeeded':
      return {
        message: message('Subscription successful!'),
        status: 'success',
        buttonLabel: message('Return to site'),
        link: '/billing',
      };
    case 'processing':
      return {
        message: message(
          "Payment processing. We'll update you when payment is received.",
        ),
        status: 'success',
        buttonLabel: message('Return to site'),
        link: '/billing',
      };
    case 'requires_payment_method':
      return {
        message: message('Payment failed. Please try another payment method.'),
        status: 'error',
        buttonLabel: message('Go back'),
        link: errorLink(productId, priceId),
      };
    default:
      return {
        message: message('Something went wrong'),
        status: 'error',
        buttonLabel: message('Go back'),
        link: errorLink(productId, priceId),
      };
  }
}

function errorLink(productId?: string, priceId?: string): string {
  return productId && priceId ? `/checkout/${productId}/${priceId}` : '/';
}

function storeSubscriptionDetailsLocally(
  intentType: 'paymentIntent' | 'setupIntent',
  intentId: string,
  subscriptionId?: string | null,
) {
  return apiClient.post('billing/stripe/store-subscription-details-locally', {
    intent_type: intentType,
    intent_id: intentId,
    subscription_id: subscriptionId,
  });
}
