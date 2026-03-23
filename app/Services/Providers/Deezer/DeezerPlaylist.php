<?php

namespace App\Services\Providers\Deezer;

use App\Services\Providers\DataObjects\NormalizedPlaylist;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;

class DeezerPlaylist extends DeezerBase
{
    public function get(string $playlistId): ?NormalizedPlaylist
    {
        $response = Http::timeout(5)->get(
            "{$this->baseUrl}/playlist/$playlistId",
        );

        $playlist = $this->getResponseData($response);

        if (!Arr::get($playlist, 'id')) {
            return null;
        }

        return $this->normalizer->playlist($playlist);
    }
}
