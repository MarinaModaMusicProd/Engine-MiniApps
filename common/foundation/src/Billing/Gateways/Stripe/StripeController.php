<?php namespace Common\Billing\Gateways\Stripe;

use Illuminate\Support\Facades\Auth;
use Common\Billing\Models\Product;
use Common\Billing\Subscription;
use Common\Billing\Gateways\Stripe\Stripe;
use Common\Core\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class StripeController extends BaseController
{
    public function __construct(
        protected Request $request,
        protected Subscription $subscription,
        protected Stripe $stripe,
    ) {
        $this->middleware('auth');
    }

    public function createPartialSubscription(): Response|JsonResponse
    {
        $data = $this->validate($this->request, [
            'product_id' => 'required|integer|exists:products,id',
            'price_id' => 'integer|exists:prices,id',
            'start_date' => 'string',
        ]);

        $product = Product::findOrFail($data['product_id']);
        $result = $this->stripe->subscriptions->createPartial(
            $product,
            Auth::user(),
            $data['price_id'],
        );

        return $this->success([
            'clientSecret' => $result['clientSecret'],
            'subscriptionId' => $result['subscriptionId'],
        ]);
    }

    public function createSetupIntent(): Response|JsonResponse
    {
        $clientSecret = $this->stripe->createSetupIntent(Auth::user());
        return $this->success(['clientSecret' => $clientSecret]);
    }

    public function changeDefaultPaymentMethod(): Response|JsonResponse
    {
        $data = $this->validate($this->request, [
            'payment_method_id' => 'required|string',
        ]);

        $this->stripe->changeDefaultPaymentMethod(
            $this->request->user(),
            $data['payment_method_id'],
        );

        return $this->success();
    }

    public function storeSubscriptionDetailsLocally(): Response|JsonResponse
    {
        $data = $this->validate($this->request, [
            'intent_type' => 'required|string',
            'intent_id' => 'required|string',
            'subscription_id' => 'string',
        ]);

        if ($data['intent_type'] === 'paymentIntent') {
            $intent = $this->stripe->client->paymentIntents->retrieve(
                $data['intent_id'],
                ['expand' => ['invoice']],
            );
            $subscriptionId = $intent->invoice->subscription;
        } else {
            $intent = $this->stripe->client->setupIntents->retrieve(
                $data['intent_id'],
            );
            $subscriptionId = $this->stripe->client->subscriptions->retrieve(
                $data['subscription_id'],
            )->id;
        }

        $this->stripe->subscriptions->sync($subscriptionId);

        return $this->success();
    }
}
