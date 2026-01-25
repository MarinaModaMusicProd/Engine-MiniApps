<?php

namespace Common\Billing\Invoices;

use Common\Billing\Invoices\Invoice;
use Common\Core\AppUrl;
use Common\Core\BaseController;
use Common\Settings\Settings;

class InvoiceController extends BaseController
{
    public function show(string $uuid)
    {
        $invoice = Invoice::query()
            ->where('uuid', $uuid)
            ->with(
                'subscription.product',
                'subscription.user',
                'subscription.price',
            )
            ->firstOrFail();

        $this->authorize('show', $invoice);

        return view('common::billing/invoice')
            ->with('invoice', $invoice)
            ->with('htmlBaseUri', app(AppUrl::class)->htmlBaseUri)
            ->with('user', $invoice->subscription->user)
            ->with('settings', app(Settings::class));
    }
}
