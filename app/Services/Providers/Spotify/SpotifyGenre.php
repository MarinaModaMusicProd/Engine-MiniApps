<?php

namespace App\Services\Providers\Spotify;

use App\Traits\AuthorizesWithSpotify;
use Illuminate\Support\Facades\Http;

class SpotifyGenre extends SpotifyBase
{
    use AuthorizesWithSpotify;

    public function get(string $genreName): ?array
    {
        $genreName = slugify($genreName);
        $response = $this->getResponseData(
            Http::timeout(5)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->authorize()}",
                ])
                ->get("{$this->baseUrl}/recommendations/available-genre-seeds"),
        );
        dd($response);

        $ids = collect($response['tracks'])
            ->pluck('artists')
            ->flatten(1)
            ->sortByDesc('popularity')
            ->slice(0, 50)
            ->pluck('id')
            ->unique()
            ->implode(',');

        if (!$ids) {
            return null;
        }

        $fullArtistsResponse = $this->getResponseData(
            Http::timeout(5)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->authorize()}",
                ])
                ->get("{$this->baseUrl}/artists?ids=$ids"),
        );

        if (empty($fullArtistsResponse['artists'])) {
            return null;
        }

        $normalizedArtists = collect($fullArtistsResponse['artists'])->map(
            fn($artist) => $this->normalizer->artist($artist),
        );

        return [
            'artists' => $normalizedArtists,
        ];
    }
}
