<?php

namespace Common\Billing;

use Common\Core\BaseController;
use Illuminate\Support\Facades\Auth;

class BillingUserController extends BaseController
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function __invoke()
    {
        $user = Auth::user();

        $subscription = $user
            ->subscriptions()
            ->with('product', 'price')
            ->orderBy('updated_at', 'desc')
            ->get()
            ->filter(fn(Subscription $subscription) => $subscription->valid())
            ->first();

        if (!$subscription) {
            return $this->error(__('No subscription found'));
        }

        $invoices = $subscription->invoices()->get();

        return $this->success([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'image' => $user->image,
                'card_brand' => $user->card_brand,
                'card_last_four' => $user->card_last_four,
                'card_expires' => $user->card_expires,
            ],
            'subscription' => $subscription,
            'invoices' => $invoices,
        ]);
    }
}
