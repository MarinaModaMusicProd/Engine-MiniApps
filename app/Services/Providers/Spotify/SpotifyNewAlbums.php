<?php namespace App\Services\Providers\Spotify;

use App\Services\Providers\ContentProvider;
use App\Services\Providers\Saving\StoreExternalDataInDb;
use App\Services\Providers\UpsertsDataIntoDB;
use App\Traits\AuthorizesWithSpotify;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

class SpotifyNewAlbums extends SpotifyBase implements ContentProvider
{
    use AuthorizesWithSpotify;

    public function getContent(): Collection
    {
        if (!config('services.spotify.use_deprecated_api')) {
            return collect();
        }

        @ini_set('max_execution_time', 0);

        $response = $this->getResponseData(
            Http::timeout(5)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->authorize()}",
                ])
                ->get(
                    "{$this->baseUrl}/browse/new-releases?country=US&limit=40",
                ),
        );
        $spotifyAlbums = $response['albums']['items'];
        $originalOrder = collect($spotifyAlbums)->keyBy('name');

        $normalizedAlbums = $this->enrichAlbums($spotifyAlbums);

        $savedData = (new StoreExternalDataInDb('spotify_id'))->execute(
            albums: $normalizedAlbums,
        );

        return collect($savedData['albums'])->sort(function ($a, $b) use (
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
        });
    }

    protected function enrichAlbums(array $albums): Collection
    {
        // 20 albums max per spotify API request
        return collect($albums)
            ->chunk(20)
            ->map(function ($albums) {
                $idString = $albums->pluck('id')->implode(',');
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
}
