<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Repost extends Model
{
    protected $guarded = [];

    public function repostable(): BelongsTo
    {
        return $this->morphTo();
    }
}
