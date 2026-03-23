<?php

namespace App\Services\Providers\Deezer;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Log;

abstract class DeezerBase
{
    protected string $baseUrl = 'https://api.deezer.com';

    protected DeezerNormalizer $normalizer;

    public function __construct()
    {
        $this->normalizer = new DeezerNormalizer();
    }

    protected function getResponseData($response): array
    {
        if ($response instanceof ConnectionException) {
            report($response);
            return [];
        }

        if (!$response || !$response->successful()) {
            if ($response) {
                $body = $response->body();
                if (str_contains($body, 'Access Denied')) {
                    Log::channel('remoteApiErrors')->error(
                        'Deezer API access denied',
                    );
                } else {
                    Log::error('Deezer API error: ' . $response->body());
                }
            }
            return [];
        }

        $data = $response->json();
        if (is_array($data) && isset($data['error'])) {
            if ($data['error']['message'] === 'Quota limit exceeded') {
                Log::channel('remoteApiErrors')->error(
                    'Deezer API quota limit exceeded',
                );
            } else {
                Log::error('Deezer API error: ' . json_encode($data['error']));
            }
            return [];
        }

        return is_array($data) ? $data : [];
    }

    protected function getUserAgent(): string
    {
        return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36';
    }
}
