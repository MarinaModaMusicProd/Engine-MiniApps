<?php namespace Common\Billing\Gateways\Paypal;

use App\Models\User;
use Common\Billing\Gateways\Stripe\FormatsMoney;
use Common\Billing\Invoices\Invoice;
use Common\Billing\Models\Price;
use Common\Billing\Models\Product;
use Common\Billing\Notifications\NewInvoiceAvailable;
use Common\Billing\Subscription;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class PaypalSubscriptions
{
    use InteractsWithPaypalRestApi, FormatsMoney;

    public function isIncomplete(Subscription $subscription): bool
    {
        return $subscription->gateway_status === 'APPROVAL_PENDING' ||
            $subscription->gateway_status === 'APPROVED';
    }

    public function isPastDue(Subscription $subscription): bool
    {
        // no way to check this via PayPal API
        return false;
    }

    public function sync(
        string $paypalSubscriptionId,
        ?int $userId = null,
    ): void {
        $response = $this->paypal()->get(
            "billing/subscriptions/$paypalSubscriptionId",
        );

        $price = Price::where('paypal_id', $response['plan_id'])->firstOrFail();

        if ($userId != null) {
            $user = User::where('id', $userId)->firstOrFail();
            $user->update(['paypal_id' => $response['subscriber']['payer_id']]);
        } else {
            $user = User::where(
                'paypal_id',
                $response['subscriber']['payer_id'],
            )->firstOrFail();
        }

        $subscription = $user->subscriptions()->firstOrNew([
            'gateway_name' => 'paypal',
            'gateway_id' => $response['id'],
        ]);

        if (
            in_array($response['status'], ['CANCELLED', 'EXPIRED', 'SUSPENDED'])
        ) {
            $subscription->markAsCancelled();
        }

        $isOnTrial =
            // subscription has 2 cycles, first is trial, second is regular
            count(Arr::get($response, 'billing_info.cycle_executions', [])) ===
                2 &&
            // first cycle is trial
            Arr::get(
                $response,
                'billing_info.cycle_executions.0.tenure_type',
            ) === 'TRIAL' &&
            // trial cycle has been completed
            Arr::get(
                $response,
                'billing_info.cycle_executions.0.cycles_completed',
            ) === 1 &&
            // regular cycle has not completed yet
            Arr::get(
                $response,
                'billing_info.cycle_executions.1.cycles_completed',
            ) === 0;

        $nextBillingTime = Arr::get(
            $response,
            'billing_info.next_billing_time',
            null,
        );

        $trialEndsAt =
            $isOnTrial && $nextBillingTime
                ? Carbon::parse($nextBillingTime)
                : null;

        $data = [
            'price_id' => $price->id,
            'product_id' => $price->product_id,
            'gateway_name' => 'paypal',
            'gateway_id' => $paypalSubscriptionId,
            'gateway_status' => $response['status'],
            'trial_ends_at' => $trialEndsAt,
            'renews_at' =>
                $response['status'] === 'ACTIVE' && $nextBillingTime
                    ? Carbon::parse($nextBillingTime)
                    : null,
        ];

        if ($response['status'] === 'ACTIVE') {
            $data['ends_at'] = null;
        }

        $subscription->fill($data)->save();

        $this->createOrUpdateInvoice($subscription, $response->json());
    }

    public function createOrUpdateInvoice(
        Subscription $subscription,
        array $paypalSubscription,
    ): void {
        // subscription is no longer active, no need to update invoice
        if (!isset($paypalSubscription['billing_info']['next_billing_time'])) {
            return;
        }

        $startTime = Carbon::parse($paypalSubscription['start_time']);
        $renewsAt = Carbon::parse(
            $paypalSubscription['billing_info']['next_billing_time'],
        );

        $status =
            $paypalSubscription['status'] === 'ACTIVE'
                ? Invoice::STATUS_PAID
                : Invoice::STATUS_DRAFT;
        $amountPaid = $subscription->onTrial()
            ? 0
            : $this->priceToCents($subscription->price);

        $invoice = Invoice::whereBetween('created_at', [
            $startTime,
            $renewsAt,
        ])->first();

        if ($invoice) {
            // paid invoices should never be set to unpaid,
            // this could happen if webhooks arrive out of order
            if ($invoice->status !== Invoice::STATUS_PAID) {
                $invoice->update([
                    'status' => $status,
                ]);
            }

            if ($amountPaid > $invoice->amount_paid) {
                $invoice->update([
                    'amount_paid' => $amountPaid,
                    'currency' => $subscription->price->currency,
                ]);
            }
        } else {
            $invoice = Invoice::create([
                'subscription_id' => $subscription->id,
                'status' => $status,
                'amount_paid' => $amountPaid,
                'currency' => $subscription->price->currency,
                'uuid' => Str::random(10),
            ]);
        }

        if ($invoice->status === Invoice::STATUS_PAID && !$invoice->notified) {
            $subscription->user->notify(new NewInvoiceAvailable($invoice));
            $invoice->update(['notified' => true]);
        }
    }

    public function changePlan(
        Subscription $subscription,
        Product $newProduct,
        Price $newPrice,
    ): bool {
        $this->paypal()->post(
            "billing/subscriptions/$subscription->gateway_id/revise",
            [
                'plan_id' => $newPrice->paypal_id,
            ],
        );

        $this->sync($subscription->gateway_id, $subscription->user_id);

        return true;
    }

    public function cancel(
        Subscription $subscription,
        $atPeriodEnd = true,
    ): bool {
        if ($atPeriodEnd) {
            $this->paypal()->post(
                "billing/subscriptions/$subscription->gateway_id/suspend",
                ['reason' => 'User requested cancellation.'],
            );
        } else {
            $this->paypal()->post(
                "billing/subscriptions/$subscription->gateway_id/cancel",
                ['reason' => 'Subscription deleted locally.'],
            );
        }

        $this->sync($subscription->gateway_id, $subscription->user_id);

        return true;
    }

    public function resume(Subscription $subscription, array $params): bool
    {
        $this->paypal()->post(
            "billing/subscriptions/$subscription->gateway_id/activate",
            ['reason' => 'Subscription resumed by user.'],
        );

        $this->sync($subscription->gateway_id, $subscription->user_id);

        return true;
    }
}
