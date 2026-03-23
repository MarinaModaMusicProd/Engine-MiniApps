<?php

namespace App\Services\Providers\Deezer;

use App\Services\Providers\DataObjects\NormalizedAlbum;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;

class DeezerAlbum extends DeezerBase
{
    public function get(string $deezerId): ?NormalizedAlbum
    {
        if (!$deezerId) {
            return null;
        }

        $response = Http::timeout(8)->get("{$this->baseUrl}/album/$deezerId");
        $deezerAlbum = $this->getResponseData($response);
        if (!Arr::get($deezerAlbum, 'id')) {
            return null;
        }

        return $this->normalizer->album($deezerAlbum, fullyScraped: true);
    }
}
