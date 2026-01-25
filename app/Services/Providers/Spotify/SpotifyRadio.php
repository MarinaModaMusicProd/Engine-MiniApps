<?php namespace App\Services\Providers\Spotify;

use App\Models\Genre;
use Illuminate\Database\Eloquent\Model;

class SpotifyRadio
{
    public function getRecommendations(Model $item, string $type)
    {
        if ($item['model_type'] === 'genre') {
            $seedId = $item->name;
        } else {
            $seedId = $item->spotify_id ?: $this->getSpotifyId($item, $type);
        }

        if (!$seedId) {
            return [];
        }

        $response = (new SpotifyHttpClient())->get(
            "recommendations?seed_{$type}s=$seedId&min_popularity=30&limit=100",
        );
        if (!isset($response['tracks'])) {
            return [];
        }

        return (new SpotifyTopTracks())->saveAndLoad($response['tracks']);
    }

    private function getSpotifyId(Model $item, string $type): ?string
    {
        if ($type === 'artist') {
            $response = (new SpotifyHttpClient())->get(
                "search?q={$item->name}&type=artist&limit=1",
            );
            return $response['artists']['items'][0]['id'] ?? null;
        } elseif ($type === 'track') {
            $response = (new SpotifyHttpClient())->get(
                "search?q=artist:{$item->album->artists->first()->name}+{$item->name}&type=track&limit=1",
            );
            return $response['tracks']['items'][0]['id'] ?? null;
        }

        return null;
    }
}
