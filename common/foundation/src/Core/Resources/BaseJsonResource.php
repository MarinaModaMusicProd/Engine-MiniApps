<?php

namespace Common\Core\Resources;

use Common\Core\Resources\PaginatedResponseCollection;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

class BaseJsonResource extends JsonResource
{
    public static function paginationResponse($resource)
    {
        return new PaginatedResponseCollection($resource, static::class);
    }
}
