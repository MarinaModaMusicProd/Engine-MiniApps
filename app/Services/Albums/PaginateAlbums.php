<?php

namespace App\Services\Albums;

use App\Models\Album;
use App\Traits\BuildsPaginatedApiResources;
use Common\Database\Datasource\Datasource;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaginateAlbums
{
    use BuildsPaginatedApiResources;

    public function asApiResponse(
        array $params,
        $builder = null,
        bool $includeScheduled = false,
        bool $includeTracks = false,
        string|null $loader = null,
    ): array {
        $paginator = $this->asPaginator(
            $params,
            $builder,
            $includeScheduled,
            $includeTracks,
            $loader,
        );

        $items = array_map(
            fn(Album $album) => (new AlbumLoader())->toApiResource(
                $album,
                loader: $loader,
            ),
            $paginator->items(),
        );

        return $this->buildPagination($paginator, $items);
    }

    public function asPaginator(
        array $params,
        $builder = null,
        bool $includeScheduled = false,
        bool $includeTracks = false,
        string|null $loader = null,
    ): AbstractPaginator {
        if (!$builder) {
            $builder = Album::query();
        }

        $builder
            ->with(['artists'])
            ->when(!$includeScheduled, fn($query) => $query->releasedOnly());

        if ($loader === 'editAlbumDatatable' || $loader === 'editArtistPage') {
            $builder->withCount('tracks');
        }

        if ($includeTracks) {
            $builder->with([
                'tracks' => function (HasMany $query) {
                    $query
                        ->with(['artists', 'uploadedSrc'])
                        ->orderBy('number', 'desc')
                        ->select(
                            'tracks.id',
                            'album_id',
                            'name',
                            'plays',
                            'image',
                            'src',
                            'duration',
                        );
                },
            ]);
        }

        $datasource = new Datasource($builder, $params);
        $order = $datasource->getOrder();

        if (Str::endsWith($order['col'], 'popularity')) {
            $datasource->order = false;
            $builder->orderByPopularity($order['dir']);
        }

        // First order by number of tracks, so all albums
        // with less than 5 tracks (singles) are at
        // the bottom, then order by album release date.
        if (Str::endsWith($order['col'], 'singlesLast')) {
            $datasource->order = false;
            $prefix = DB::getTablePrefix();
            $builder
                ->withCount('tracks')
                // albums can have identical release dates, order by id to avoid duplicates in pagination
                ->orderByRaw(
                    "tracks_count >= 5 desc, {$prefix}albums.release_date desc, {$prefix}albums.id desc",
                );
        }

        return $datasource->paginate();
    }
}
