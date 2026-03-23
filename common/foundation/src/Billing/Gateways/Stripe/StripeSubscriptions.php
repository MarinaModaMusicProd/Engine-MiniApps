<?php namespace Common\Billing\Gateways\Stripe;

use App\Models\User;
use Carbon\Carbon;
use Common\Billing\Invoices\Invoice;
use Common\Billing\Models\Price;
use Common\Billing\Models\Product;
use Common\Billing\Notifications\NewInvoiceAvailable;
use Common\Billing\Subscription;
use Stripe\Exception\InvalidRequestException;
use Stripe\Invoice as StripeInvoice;
use Stripe\StripeClient;
use Stripe\Subscription as StripeSubscription;

class StripeSubscriptions
{
    public function __construct(public StripeClient $client) {}

    public function isIncomplete(Subscription $subscription): bool
    {
        return $subscription->gateway_status ===
            StripeSubscription::STATUS_INCOMPLETE ||
            ($subscription->gateway_status ===
                StripeSubscription::STATUS_INCOMPLETE_EXPIRED &&
                $subscription->gateway_status !==
                    StripeSubscription::STATUS_UNPAID);
    }

    public function isPastDue(Subscription $subscription): bool
    {
        return $subscription->gateway_status ===
            StripeSubscription::STATUS_PAST_DUE;
    }

    public function sync(string $stripeSubscriptionId): void
    {
        $stripeSubscription = $this->client->subscriptions->retrieve(
            $stripeSubscriptionId,
            ['expand' => ['latest_invoice']],
        );
        $price = Price::where(
            'stripe_id',
            $stripeSubscription->items->data[0]->price->id,
        )->firstOrFail();
        $user = User::where(
            'stripe_id',
            $stripeSubscription->customer,
        )->firstOrFail();

        $subscription = $user->subscriptions()->firstOrNew([
            'gateway_name' => 'stripe',
            'gateway_id' => $stripeSubscription->id,
        ]);

        // Cancellation date...
        if ($stripeSubscription->cancel_at_period_end) {
            $subscription->ends_at = $subscription->onTrial()
                ? $subscription->trial_ends_at
                : Carbon::createFromTimestamp(
                    $stripeSubscription->current_period_end,
                );
        } elseif (
            $stripeSubscription->cancel_at ||
            $stripeSubscription->canceled_at
        ) {
            $subscription->ends_at = Carbon::createFromTimestamp(
                $stripeSubscription->cancel_at ??
                    $stripeSubscription->canceled_at,
            );
        } else {
            $subscription->ends_at = null;
        }

        // if we created a subscription with trial, but user has not entered payment details yet, mark it as incomplete locally, otherwise subscription will be interpreted as fully active
        $status =
            $stripeSubscription->status ===
                StripeSubscription::STATUS_TRIALING &&
            $stripeSubscription->pending_setup_intent !== null
                ? StripeSubscription::STATUS_INCOMPLETE
                : $stripeSubscription->status;

        $subscription
            ->fill([
                'price_id' => $price->id,
                'product_id' => $price->product_id,
                'gateway_name' => 'stripe',
                'gateway_id' => $stripeSubscription->id,
                'gateway_status' => $status,
                'renews_at' =>
                    $subscription->ends_at ||
                    $status === StripeSubscription::STATUS_INCOMPLETE
                        ? null
                        : Carbon::createFromTimestamp(
                            $stripeSubscription->current_period_end,
                        ),
                'trial_ends_at' =>
                    $status === StripeSubscription::STATUS_TRIALING
                        ? Carbon::createFromTimestamp(
                            $stripeSubscription->trial_end,
                        )
                        : null,
            ])
            ->save();

        if (
            $stripeSubscription->latest_invoice &&
            $stripeSubscription->status !==
                StripeSubscription::STATUS_INCOMPLETE
        ) {
            $this->createOrUpdateInvoice(
                $subscription,
                $stripeSubscription->latest_invoice->toArray(),
            );
        }
    }

    public function createPartial(
        Product $product,
        User $user,
        ?int $priceId = null,
    ): array {
        $price = $priceId
            ? $product->prices()->findOrFail($priceId)
            : $product->prices->firstOrFail();

        $user = $this->syncStripeCustomer($user);

        // find incomplete subscriptions for this customer and price
        $stripeSubscriptions = $this->client->subscriptions->all([
            'customer' => $user->stripe_id,
            'price' => $price->stripe_id,
            'expand' => [
                'data.latest_invoice.payment_intent',
                'data.pending_setup_intent',
            ],
        ]);

        $stripeSubscription = null;
        foreach ($stripeSubscriptions as $subscription) {
            $isIncompleteTrial =
                $subscription->status === StripeSubscription::STATUS_TRIALING &&
                $subscription->pending_setup_intent !== null;
            $isIncomplete =
                $subscription->status === StripeSubscription::STATUS_INCOMPLETE;
            if (
                ($product->trial_period_days && $isIncompleteTrial) ||
                $isIncomplete
            ) {
                $stripeSubscription = $subscription;
                break;
            }
        }

        // if matching subscription was not created yet, do it now
        if (!$stripeSubscription) {
            $stripeSubscription = $this->client->subscriptions->create([
                'customer' => $user->stripe_id,
                'items' => [
                    [
                        'price' => $price->stripe_id,
                    ],
                ],
                'trial_period_days' => $product->trial_period_days ?? 0,
                'payment_behavior' => 'default_incomplete',
                'payment_settings' => [
                    'save_default_payment_method' => 'on_subscription',
                ],
                'trial_settings' => [
                    'end_behavior' => ['missing_payment_method' => 'cancel'],
                ],
                'expand' => [
                    'latest_invoice.payment_intent',
                    // needed if using trial period, because payment_intent on latest_invoice will not exist
                    'pending_setup_intent',
                ],
            ]);
        }

        // return client secret, needed in frontend to complete subscription
        $clientSecret =
            $stripeSubscription->latest_invoice->payment_intent
                ->client_secret ??
            $stripeSubscription->pending_setup_intent->client_secret;
        return [
            'clientSecret' => $clientSecret,
            'subscriptionId' => $stripeSubscription->id,
        ];
    }

    public function cancel(
        Subscription $subscription,
        bool $atPeriodEnd = true,
    ): bool {
        if (!$subscription->user?->stripe_id) {
            return true;
        }

        try {
            $stripeSubscription = $this->client->subscriptions->retrieve(
                $subscription->gateway_id,
            );
        } catch (InvalidRequestException $e) {
            if ($e->getStripeCode() === 'resource_missing') {
                return true;
            }
            throw $e;
        }

        // cancel subscription at current period end and don't delete
        if ($atPeriodEnd) {
            $updatedSubscription = $this->client->subscriptions->update(
                $stripeSubscription->id,
                [
                    'cancel_at_period_end' => true,
                ],
            );
            $subscription
                ->fill([
                    'gateway_status' => $updatedSubscription->status,
                ])
                ->save();
            return $updatedSubscription->cancel_at_period_end;
            // cancel and delete subscription instantly
        } else {
            try {
                $stripeSubscription = $this->client->subscriptions->cancel(
                    $stripeSubscription->id,
                );
                return $stripeSubscription->status === 'cancelled';
            } catch (InvalidRequestException $e) {
                return $e->getStripeCode() === 'resource_missing';
            }
        }
    }

    public function resume(Subscription $subscription, array $params): bool
    {
        $stripeSubscription = $this->client->subscriptions->retrieve(
            $subscription->gateway_id,
        );

        $updatedSubscription = $this->client->subscriptions->update(
            $stripeSubscription->id,
            array_merge(
                [
                    'cancel_at_period_end' => false,
                ],
                $params,
            ),
        );

        $subscription
            ->fill([
                'gateway_status' => $updatedSubscription->status,
            ])
            ->save();

        return $updatedSubscription->status === 'active';
    }

    public function changePlan(
        Subscription $subscription,
        Product $newProduct,
        Price $newPrice,
    ): bool {
        $stripeSubscription = $this->client->subscriptions->retrieve(
            $subscription->gateway_id,
        );

        $updatedSubscription = $this->client->subscriptions->update(
            $stripeSubscription->id,
            [
                'proration_behavior' => 'always_invoice',
                'items' => [
                    [
                        'id' => $stripeSubscription->items->data[0]->id,
                        'price' => $newPrice->stripe_id,
                    ],
                ],
            ],
        );

        return $updatedSubscription->status === 'active';
    }

    public function createOrUpdateInvoice(
        Subscription $subscription,
        array $stripeInvoice,
    ): void {
        $invoice = Invoice::where('uuid', $stripeInvoice['id'])->first();
        if ($invoice) {
            // paid invoices should never be set to unpaid,
            // this could happen if webhooks arrive out of order
            if ($invoice->status !== Invoice::STATUS_PAID) {
                $invoice->update(['status' => $stripeInvoice['status']]);
            }

            if ($stripeInvoice['amount_paid'] > $invoice->amount_paid) {
                $invoice->update([
                    'amount_paid' => $stripeInvoice['amount_paid'],
                    'currency' => $stripeInvoice['currency'],
                ]);
            }
        } else {
            $invoice = Invoice::create([
                'subscription_id' => $subscription->id,
                'uuid' => $stripeInvoice['id'],
                'status' => $stripeInvoice['status'],
                'amount_paid' => $stripeInvoice['amount_paid'] ?? 0,
                'currency' => $stripeInvoice['currency'] ?? 'usd',
            ]);
        }

        if ($invoice->status === Invoice::STATUS_PAID && !$invoice->notified) {
            $subscription->user->notify(new NewInvoiceAvailable($invoice));
            $invoice->update(['notified' => true]);
        }
    }

    protected function syncStripeCustomer(User $user): User
    {
        // make sure user with stored stripe ID actually exists on stripe
        if ($user->stripe_id) {
            try {
                $this->client->customers->retrieve($user->stripe_id);
            } catch (InvalidRequestException $e) {
                $user->stripe_id = null;
            }
        }

        // create customer object on stripe, if it does not exist already
        if (!$user->stripe_id) {
            $customer = $this->client->customers->create([
                'email' => $user->email,
                'metadata' => [
                    'userId' => $user->id,
                ],
            ]);
            $user->fill(['stripe_id' => $customer->id])->save();
        }

        return $user;
    }
}
