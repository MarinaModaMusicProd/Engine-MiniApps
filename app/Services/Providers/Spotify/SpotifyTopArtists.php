<?php

namespace App\Services\Providers\Spotify;

use App\Services\Providers\ContentProvider;
use App\Services\Providers\Saving\StoreExternalDataInDb;
use App\Traits\AuthorizesWithSpotify;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

class SpotifyTopArtists extends SpotifyBase implements ContentProvider
{
    use AuthorizesWithSpotify;

    public function getContent(): Collection
    {
        $topArtists = (new SpotifyCharts())->getTopArtists();

        if (empty($topArtists)) {
            return collect();
        }

        $originalOrder = collect($topArtists)->keyBy('name');

        $normalizedArtists = config('services.spotify.use_deprecated_api')
            ? $this->enrichArtists($topArtists)
            : collect($topArtists);

        $savedData = (new StoreExternalDataInDb('spotify_id'))->execute(
            artists: $normalizedArtists,
        );

        return collect($savedData['artists'])->sort(function ($a, $b) use (
            $originalOrder,
        ) {
            $originalAIndex = isset($originalOrder[$a->name])
                ? $originalOrder[$a->name]
                : 0;
            $originalBIndex = isset($originalOrder[$b->name])
                ? $originalOrder[$b->name]
                : 0;

            if ($originalAIndex == $originalBIndex) {
                return 0;
            }
            return $originalAIndex < $originalBIndex ? -1 : 1;
        })->values();
    }

    protected function enrichArtists(array $artists): Collection
    {
        // 20 artists max per spotify API request
        return collect($artists)
            ->chunk(20)
            ->map(function ($artists) {
                $idString = $artists->pluck('externalId')->implode(',');
                return $this->getResponseData(
                    Http::timeout(5)
                        ->withHeaders([
                            'Authorization' => "Bearer {$this->authorize()}",
                        ])
                        ->get("{$this->baseUrl}/artists?ids=$idString"),
                )['artists'] ?? null;
            })
            ->filter()
            ->flatten(1)
            ->map(fn($artist) => $this->normalizer->artist($artist));
    }
}
