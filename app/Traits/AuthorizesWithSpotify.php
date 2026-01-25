<?php namespace App\Traits;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;

trait AuthorizesWithSpotify
{
    public function authorize(array $options = []): string|null
    {
        $spotifyId = $options['spotifyId'] ?? config('services.spotify.id');
        $spotifySecret =
            $options['spotifySecret'] ?? config('services.spotify.secret');
        $force = $options['force'] ?? false;
        $cacheKey = 'spotify-token';

        if (!$force && ($token = cache()->get($cacheKey))) {
            return $token;
        }

        $response = Http::throw()
            ->asForm()
            ->withHeaders([
                'Authorization' =>
                    'Basic ' . base64_encode($spotifyId . ':' . $spotifySecret),
            ])
            ->post('https://accounts.spotify.com/api/token', [
                'grant_type' => 'client_credentials',
            ]);

        if (isset($response['access_token'])) {
            cache()->put(
                $cacheKey,
                $response['access_token'],
                Carbon::now()->addSeconds($response['expires_in']),
            );
            return $response['access_token'];
        }

        return null;
    }
}
