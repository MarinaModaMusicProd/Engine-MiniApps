<?php namespace App\Services\Providers\Spotify;

use App\Traits\AuthorizesWithSpotify;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SpotifyHttpClient
{
    use AuthorizesWithSpotify;

    static string $baseUrl = 'https://api.spotify.com/v1';

    public function get(string $uri): array
    {
        try {
            $token = $this->authorize();

            if (!$token) {
                return [];
            }

            return Http::throw()
                ->withHeaders(['Authorization' => 'Bearer ' . $token])
                ->timeout(5)
                ->get("https://api.spotify.com/v1/$uri")
                ->json();
        } catch (RequestException $e) {
            Log::error('Spotify API error: ' . $e->response->body());
            return [];
        }
    }
}
