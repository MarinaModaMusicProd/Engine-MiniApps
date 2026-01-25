<?php

namespace App\Models;

use Common\Tags\Tag as BaseTag;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Tag extends BaseTag
{
    protected $hidden = ['type', 'created_at', 'updated_at'];

    public function tracks()
    {
        return $this->morphedByMany(Track::class, 'taggable');
    }

    public function albums()
    {
        return $this->morphedByMany(Album::class, 'taggable');
    }
}
