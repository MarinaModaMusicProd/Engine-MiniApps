<?php

namespace App\Services\Tracks;

use App\Traits\BuildsPaginatedApiResources;
use App\Models\Track;
use Common\Database\Datasource\Datasource;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Support\Str;

class PaginateTracks
{
    use BuildsPaginatedApiResources;

    public function asApiResponse(
        array $params,
        $builder = null,
        string|null $loader = null,
        bool $hasCustomOrder = false,
    ): array {
        $paginator = $this->asPaginator(
            $params,
            $builder,
            $loader,
            $hasCustomOrder,
        );

        $items = array_map(
            fn(Track $track) => (new TrackLoader())->toApiResource(
                $track,
                loader: $loader,
            ),
            $paginator->items(),
        );

        return $this->buildPagination($paginator, $items);
    }

    public function asPaginator(
        array $params,
        $builder = null,
        string|null $loader = null,
        bool $hasCustomOrder = false,
    ): AbstractPaginator {
        if (!$builder) {
            $builder = Track::query();
        }

        $builder
            ->with('album.artists')
            ->with(['artists', 'genres', 'uploadedSrc'])
            ->withCount(['likes', 'reposts']);

        $datasource = new Datasource($builder, $params);
        $order = $datasource->getOrder();

        if ($hasCustomOrder) {
            $datasource->order = false;
        } elseif (Str::endsWith($order['col'], 'popularity')) {
            $datasource->order = false;
            $builder->orderByPopularity($order['dir']);
        }

        return $datasource->paginate();
    }
}
