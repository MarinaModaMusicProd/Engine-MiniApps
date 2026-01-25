<?php

namespace App\Services\Providers\Spotify;

use App\Services\Providers\UpsertsDataIntoDB;
use Illuminate\Support\Facades\App;

class SpotifyPlaylist
{
    use UpsertsDataIntoDB;

    /**
     * @var SpotifyHttpClient
     */
    private $httpClient;

    /**
     * @var SpotifyNormalizer
     */
    private $normalizer;

    public function __construct(SpotifyNormalizer $normalizer)
    {
        $this->httpClient = App::make(SpotifyHttpClient::class);
        $this->normalizer = $normalizer;

        @ini_set('max_execution_time', 0);
    }

    public function getContent(string $playlistId): ?array
    {
        $response = $this->httpClient->get("playlists/$playlistId");
        if (!isset($response['tracks']['items'])) {
            return null;
        }

        $tracks = array_map(function ($track) {
            return $track['track'];
        }, $response['tracks']['items']);

        return [
            'playlist' => $this->normalizer->playlist($response),
            'tracks' => app(SpotifyTopTracks::class)->saveAndLoad($tracks),
        ];
    }
}
