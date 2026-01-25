<?php

namespace App\Services\Genres;

use App\Models\Genre;
use App\Traits\BuildsPaginatedApiResources;
use Common\Database\Datasource\Datasource;
use Illuminate\Pagination\AbstractPaginator;

class PaginateGenres
{
    use BuildsPaginatedApiResources;

    public function asApiResponse(array $params, $builder = null): array
    {
        $paginator = $this->asPaginator($params, $builder);

        $items = array_map(function (Genre $genre) {
            return (new GenreToApiResource())->execute($genre);
        }, $paginator->items());

        return $this->buildPagination($paginator, $items);
    }

    public function asPaginator(
        array $params,
        $builder = null,
    ): AbstractPaginator {
        if (!$builder) {
            $builder = Genre::query();
        }

        $datasource = new Datasource($builder, $params);

        return $datasource->paginate();
    }
}
