<?php namespace App\Services\Providers\Spotify;

use App\Models\Album;
use Illuminate\Support\Arr;

class SpotifyAlbum
{
    public function getContent(Album $album): ?array
    {
        if (!$album->spotify_id) {
            return null;
        }

        $spotifyAlbum = (new SpotifyHttpClient())->get(
            "albums/{$album->spotify_id}",
        );

        if (!$spotifyAlbum || !Arr::get($spotifyAlbum, 'id')) {
            return null;
        }

        $normalizedAlbum = (new SpotifyNormalizer())->album($spotifyAlbum);

        // get full info objects for all tracks
        $normalizedAlbum = $this->getTracks($normalizedAlbum);
        $normalizedAlbum['fully_scraped'] = true;

        return $normalizedAlbum;
    }

    private function getTracks(array $normalizedAlbum): array
    {
        $trackIds = $normalizedAlbum['tracks']
            ->pluck('spotify_id')
            ->slice(0, 50)
            ->implode(',');

        $response = (new SpotifyHttpClient())->get("tracks?ids=$trackIds");

        if (!isset($response['tracks'])) {
            return $normalizedAlbum;
        }

        $fullTracks = collect($response['tracks'])->map(function (
            $spotifyTrack,
        ) {
            return (new SpotifyNormalizer())->track($spotifyTrack);
        });

        $normalizedAlbum['tracks'] = $normalizedAlbum['tracks']->map(function (
            $track,
        ) use ($fullTracks) {
            return $fullTracks
                ->where('spotify_id', $track['spotify_id'])
                ->first();
        });

        return $normalizedAlbum;
    }
}
