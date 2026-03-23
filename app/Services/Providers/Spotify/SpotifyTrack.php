<?php

namespace App\Services\Providers\Spotify;

use App\Services\Providers\DataObjects\NormalizedTrack;
use App\Traits\AuthorizesWithSpotify;
use Illuminate\Support\Facades\Http;

class SpotifyTrack extends SpotifyBase
{
    use AuthorizesWithSpotify;

    public function get(string $spotifyId): ?NormalizedTrack
    {
        if (!$spotifyId) {
            return null;
        }

        $token = $this->authorize();
        if (!$token) {
            return null;
        }

        $spotifyTrack = $this->getResponseData(
            Http::withHeaders(['Authorization' => "Bearer $token"])->get(
                "{$this->baseUrl}/tracks/$spotifyId",
            ),
        );

        if (!$spotifyTrack || !isset($spotifyTrack['id'])) {
            return null;
        }

        return $this->normalizer->track($spotifyTrack);
    }
}
