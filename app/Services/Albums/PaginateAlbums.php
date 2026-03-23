<?php

namespace App\Services\Albums;

use App\Models\Album;
use App\Services\Providers\MusicMetadataProvider;
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

        $externalProvider = (new MusicMetadataProvider())->getProvider();

        $builder
            ->with(['artists'])
            // partial albums might have release date as null,
            //excluding scheduled album will not work in this case
            ->when(
                !$includeScheduled && !$externalProvider,
                fn($query) => $query->releasedOnly(),
            );

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

        if (!isset($params['order'])) {
            $params['order'] = 'record_type|desc';
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
        if (Str::endsWith($order['col'], 'record_type')) {
            $datasource->order = false;
            // albums can have identical release dates, order by id to avoid duplicates in pagination
            $builder
                ->orderByRecordType()
                ->orderBy('release_date', 'desc')
                ->orderBy('id', 'desc');
        }

        return $datasource->paginate();
    }
}
