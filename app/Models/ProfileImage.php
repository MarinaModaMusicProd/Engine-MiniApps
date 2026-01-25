<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfileImage extends Model
{
    protected $guarded = [];

    protected $casts = [
        'id' => 'integer',
        'artist_id' => 'integer',
        'user_id' => 'integer',
    ];

    protected $visible = [
        'url' => 'url',
    ];
}
