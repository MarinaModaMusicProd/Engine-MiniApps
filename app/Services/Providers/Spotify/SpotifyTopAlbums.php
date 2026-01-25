<?php

namespace App\Services\Providers\Spotify;

use Illuminate\Support\Collection;

class SpotifyTopAlbums
{
    public function execute(): Collection
    {
        $ids = (new SpotifyCharts())->getAlbumIds();

        if (!is_null($ids)) {
            // 20 albums max per spotify API request
            $chunkedIds = collect($ids)->chunk(20);

            $albums = $chunkedIds
                ->map(function ($ids) {
                    $idString = $ids->implode(',');
                    return app(SpotifyHttpClient::class)->get(
                        "albums?ids=$idString",
                    )['albums'] ?? null;
                })
                ->filter()
                ->flatten(1)
                ->map(fn($album) => (new SpotifyNormalizer())->album($album));

            return (new SaveMultipleSpotifyAlbums())->execute(
                $albums,
                orderBy: 'spotify_popularity',
            );
        }

        return collect();
    }
}
