<?php

namespace App\Services\Artists;

use App\Models\Artist;
use App\Traits\BuildsPaginatedApiResources;
use Common\Database\Datasource\Datasource;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Support\Str;

class PaginateArtists
{
    use BuildsPaginatedApiResources;

    public function asApiResponse(
        array $params,
        $builder = null,
        string|null $loader = null,
    ): array {
        $paginator = $this->asPaginator($params, $builder, $loader);

        $items = array_map(
            fn(Artist $artist) => (new ArtistLoader())->toApiResource(
                $artist,
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
    ): AbstractPaginator {
        if (!$builder) {
            $builder = Artist::query();
        }

        $datasource = new Datasource($builder, $params);
        $order = $datasource->getOrder();

        if (Str::endsWith($order['col'], 'popularity')) {
            $datasource->order = false;
            $builder->orderByPopularity($order['dir']);
        }

        return $datasource->paginate();
    }
}
