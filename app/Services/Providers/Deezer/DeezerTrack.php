<?php

namespace App\Services\Providers\Deezer;

use App\Services\Providers\DataObjects\NormalizedTrack;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;

class DeezerTrack extends DeezerBase
{
    public function get(string $deezerId): ?NormalizedTrack
    {
        if (!$deezerId) {
            return null;
        }

        $response = Http::timeout(8)->get("{$this->baseUrl}/track/$deezerId");
        $deezerTrack = $this->getResponseData($response);

        if (!Arr::get($deezerTrack, 'id')) {
            return null;
        }

        return $this->normalizer->track($deezerTrack);
    }
}
