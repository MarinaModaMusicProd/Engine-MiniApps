<?php

namespace App\Services\Providers\Spotify;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

abstract class SpotifyBase
{
    protected string $baseUrl = 'https://api.spotify.com/v1';

    protected SpotifyNormalizer $normalizer;

    public function __construct()
    {
        $this->normalizer = new SpotifyNormalizer();
    }

    protected function getResponseData($response): array
    {
        if ($response instanceof ConnectionException) {
            report($response);
            return [];
        }

        if (!$response || !$response->successful()) {
            if ($response) {
                Log::error('Spotify API error: ' . $response?->body());
            }
            return [];
        }

        $data = $response->json();
        if (!is_array($data)) {
            return [];
        }

        if (isset($data['error'])) {
            Log::error(
                'Spotify API error payload: ' .
                    json_encode(Arr::get($data, 'error')),
            );
            return [];
        }

        return $data;
    }
}
