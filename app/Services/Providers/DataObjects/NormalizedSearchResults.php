<?php

namespace App\Services\Providers\DataObjects;

use App\Services\Albums\AlbumLoader;
use App\Services\Artists\ArtistLoader;
use App\Services\Tracks\TrackLoader;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class NormalizedSearchResults
{
    /**
     * @param array{
     *     total: int,
     *     offset: int,
     *     data: Collection<int, NormalizedArtist>
     * }|null $artists
     * @param array{
     *     total: int,
     *     offset: int,
     *     data: Collection<int, NormalizedAlbum>
     * }|null $albums
     * @param array{
     *     total: int,
     *     offset: int,
     *     data: Collection<int, NormalizedTrack>
     * }|null $tracks
     */
    public function __construct(
        public array|null $artists,
        public array|null $albums,
        public array|null $tracks,
    ) {}

    public function toLocalPagination(
        array $savedResults,
        int $page,
        int $perPage,
    ): array {
        $response = [];

        if ($this->artists) {
            $response['artists'] = $this->normalizedResultsSetToLocalPagination(
                $this->artists,
                $savedResults['artists'],
                $page,
                $perPage,
            );
        }

        if ($this->albums) {
            $response['albums'] = $this->normalizedResultsSetToLocalPagination(
                $this->albums,
                $savedResults['albums'],
                $page,
                $perPage,
            );
        }

        if ($this->tracks) {
            $response['tracks'] = $this->normalizedResultsSetToLocalPagination(
                $this->tracks,
                $savedResults['tracks'],
                $page,
                $perPage,
            );
        }

        return $response;
    }

    protected function normalizedResultsSetToLocalPagination(
        array $normalizedResults,
        array|Collection $savedResults,
        int $page,
        int $perPage,
    ): AbstractPaginator {
        $items = collect($savedResults);
        $total = $normalizedResults['total'];
        return new LengthAwarePaginator(
            $this->itemToApiResource($items),
            $total,
            $perPage,
            $page,
        );
    }

    protected function itemToApiResource(Collection $items): array
    {
        return $items
            ->map(
                fn($item) => match ($item['model_type']) {
                    'artist' => (new ArtistLoader())->toApiResource($item),
                    'album' => (new AlbumLoader())->toApiResource($item),
                    'track' => (new TrackLoader())->toApiResource($item),
                },
            )
            ->toArray();
    }
}
