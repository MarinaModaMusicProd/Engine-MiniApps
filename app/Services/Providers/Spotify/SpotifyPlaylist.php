<?php

namespace App\Services\Providers\Spotify;

use App\Services\Providers\DataObjects\NormalizedPlaylist;
use App\Traits\AuthorizesWithSpotify;
use Illuminate\Support\Facades\Http;

class SpotifyPlaylist extends SpotifyBase
{
    use AuthorizesWithSpotify;

    public function getContent(string $playlistId): ?NormalizedPlaylist
    {
        @ini_set('max_execution_time', 0);

        $response = $this->getResponseData(
            Http::withHeaders([
                'Authorization' => "Bearer {$this->authorize()}",
            ])->get("{$this->baseUrl}/playlists/$playlistId"),
        );
        if (!isset($response['tracks']['items'])) {
            return null;
        }

        return $this->normalizer->playlist($response);
    }
}
