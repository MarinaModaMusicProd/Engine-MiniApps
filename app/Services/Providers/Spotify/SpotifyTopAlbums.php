<?php

namespace App\Services\Providers\Spotify;

use App\Services\Providers\ContentProvider;
use App\Services\Providers\MusicMetadataProvider;
use App\Services\Providers\Saving\StoreExternalDataInDb;
use App\Traits\AuthorizesWithSpotify;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

class SpotifyTopAlbums extends SpotifyBase implements ContentProvider
{
    use AuthorizesWithSpotify;

    public function getContent(): Collection
    {
        $topAlbums = (new SpotifyCharts())->getTopAlbums();

        if (empty($topAlbums)) {
            return collect();
        }

        $originalOrder = collect($topAlbums)->keyBy('name');

        $normalizedAlbums = config('services.spotify.use_deprecated_api')
            ? $this->enrichAlbums($topAlbums)
            : collect($topAlbums);

        $savedData = (new StoreExternalDataInDb('spotify_id'))->execute(
            albums: $normalizedAlbums,
        );

        return collect($savedData['albums'])
            ->sort(function ($a, $b) use ($originalOrder) {
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
            })
            ->values();
    }

    protected function enrichAlbums(array $albums): Collection
    {
        // 20 albums max per spotify API request
        return collect($albums)
            ->chunk(20)
            ->map(function ($albums) {
                $idString = $albums->pluck('externalId')->implode(',');
                return $this->getResponseData(
                    Http::timeout(5)
                        ->withHeaders([
                            'Authorization' => "Bearer {$this->authorize()}",
                        ])
                        ->get("{$this->baseUrl}/albums?ids=$idString"),
                )['albums'] ?? null;
            })
            ->filter()
            ->flatten(1)
            ->map(fn($album) => $this->normalizer->album($album));
    }

    // can use this, if needed
    protected function getFromPlaylist()
    {
        return (new MusicMetadataProvider('spotify'))->importPlaylist(
            '7qWT4WcLgV6UUIPde0fqf9',
            createLocalPlaylist: false,
        )['albums'] ?? collect();
    }
}
