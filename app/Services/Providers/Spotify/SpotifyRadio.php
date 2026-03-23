<?php namespace App\Services\Providers\Spotify;

use App\Models\Artist;
use App\Models\Genre;
use App\Models\Track;
use App\Traits\AuthorizesWithSpotify;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

class SpotifyRadio extends SpotifyBase
{
    use AuthorizesWithSpotify;

    public function getRecommendations(Model $model): Collection
    {
        $modelType = $model->getMorphClass();

        if ($modelType === Genre::MODEL_TYPE) {
            $seedId = $model->name;
        } else {
            $seedId = $model->spotify_id ?: $this->getSpotifyId($model);
        }

        if (!$seedId) {
            return collect();
        }

        $response = $this->getResponseData(
            Http::timeout(5)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->authorize()}",
                ])
                ->get(
                    "{$this->baseUrl}/recommendations?seed_{$modelType}s=$seedId&min_popularity=30&limit=100",
                ),
        );

        return collect($response['tracks'] ?? [])->map(
            fn($track) => $this->normalizer->track($track),
        );
    }

    private function getSpotifyId(Model $model): ?string
    {
        if ($model->getMorphClass() === Artist::MODEL_TYPE) {
            $response = $this->getResponseData(
                Http::timeout(5)
                    ->withHeaders([
                        'Authorization' => "Bearer {$this->authorize()}",
                    ])
                    ->get(
                        "{$this->baseUrl}/search?q={$model->name}&type=artist&limit=1",
                    ),
            );

            return $response['artists']['items'][0]['id'] ?? null;
        } elseif ($model->getMorphClass() === Track::MODEL_TYPE) {
            $response = $this->getResponseData(
                Http::timeout(5)
                    ->withHeaders([
                        'Authorization' => "Bearer {$this->authorize()}",
                    ])
                    ->get(
                        "{$this->baseUrl}/search?q=artist:{$model->album->artists->first()->name}+{$model->name}&type=track&limit=1",
                    ),
            );

            return $response['tracks']['items'][0]['id'] ?? null;
        }

        return null;
    }
}
