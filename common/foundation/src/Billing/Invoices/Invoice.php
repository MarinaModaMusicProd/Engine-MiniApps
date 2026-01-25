<?php

namespace Common\Billing\Invoices;

use Common\Billing\Subscription;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    protected $guarded = ['id'];

    public const STATUS_PAID = 'paid';
    public const STATUS_DRAFT = 'draft';

    protected $casts = [
        'id' => 'integer',
        'subscription_id' => 'integer',
        'status' => 'string',
        'currency' => 'string',
        'amount_paid' => 'integer', // in cents
        'notified' => 'boolean',
    ];

    const MODEL_TYPE = 'invoice';

    public static function getModelTypeAttribute(): string
    {
        return self::MODEL_TYPE;
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }
}
