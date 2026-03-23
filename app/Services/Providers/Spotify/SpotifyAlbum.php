<?php

namespace App\Services\Providers\Spotify;

use App\Services\Providers\DataObjects\NormalizedAlbum;
use App\Services\Providers\DataObjects\NormalizedTrack;
use App\Traits\AuthorizesWithSpotify;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;

class SpotifyAlbum extends SpotifyBase
{
    use AuthorizesWithSpotify;

    public function get(string $spotifyId): ?NormalizedAlbum
    {
        if (!$spotifyId) {
            return null;
        }

        $token = $this->authorize();
        if (!$token) {
            return null;
        }

        $spotifyAlbum = $this->getResponseData(
            Http::withHeaders(['Authorization' => "Bearer $token"])->get(
                "{$this->baseUrl}/albums/$spotifyId",
            ),
        );

        if (!$spotifyAlbum || !Arr::get($spotifyAlbum, 'id')) {
            return null;
        }

        $normalizedAlbum = $this->normalizer->album(
            $spotifyAlbum,
            fullyScraped: true,
        );

        return $this->enrichTracks($normalizedAlbum);
    }

    private function enrichTracks(
        NormalizedAlbum $normalizedAlbum,
    ): NormalizedAlbum {
        $trackIds = collect($normalizedAlbum->tracks ?? [])
            ->pluck('externalId')
            ->filter()
            ->slice(0, 50)
            ->implode(',');

        if (!$trackIds) {
            return $normalizedAlbum;
        }

        $token = $this->authorize();
        if (!$token) {
            return $normalizedAlbum;
        }

        $response = $this->getResponseData(
            Http::withHeaders(['Authorization' => "Bearer $token"])->get(
                "{$this->baseUrl}/tracks?ids=$trackIds",
            ),
        );

        if (!isset($response['tracks'])) {
            return $normalizedAlbum;
        }

        if (config('services.spotify.use_deprecated_api')) {
            $fullTracksByExternalId = collect($response['tracks'])
                ->map(
                    fn(array $spotifyTrack) => $this->normalizer->track(
                        $spotifyTrack,
                    ),
                )
                ->keyBy(fn(NormalizedTrack $track) => $track->externalId);
        } else {
            $fullTracksByExternalId = collect();
        }

        $enrichedTracks = array_values(
            array_map(
                fn(NormalizedTrack $track) => $fullTracksByExternalId->get(
                    $track->externalId,
                ) ?? $track,
                $normalizedAlbum->tracks ?? [],
            ),
        );

        $normalizedAlbum->setTracks($enrichedTracks);

        return $normalizedAlbum;
    }
}
