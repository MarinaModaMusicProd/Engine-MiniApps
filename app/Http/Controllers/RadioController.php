<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\Genre;
use App\Models\Track;
use App\Services\Artists\ArtistLoader;
use App\Services\Genres\GenreToApiResource;
use App\Services\Providers\Spotify\SpotifyRadio;
use App\Services\Tracks\TrackLoader;
use Carbon\Carbon;
use Common\Core\BaseController;
use Illuminate\Support\Facades\Cache;

class RadioController extends BaseController
{
    public function getRecommendations(string $modelType, int $modelId): array
    {
        $model = $this->findModel($modelType, $modelId);

        $this->authorize('index', Track::class);

        $recommendations = Cache::remember(
            "radio.$modelType.{$model['id']}",
            Carbon::now()->addDays(2),
            function () use ($model, $modelType) {
                $tracks = (new SpotifyRadio())
                    ->getRecommendations($model, $modelType)
                    ->map(
                        fn($track) => (new TrackLoader())->toApiResource(
                            $track,
                        ),
                    );

                return empty($tracks) ? null : $tracks;
            },
        );

        $seed = match ($modelType) {
            'artist' => (new ArtistLoader())->toApiResource($model),
            'genre' => (new GenreToApiResource())->execute($model),
            'track' => (new TrackLoader())->toApiResource($model),
        };

        return [
            'type' => $modelType,
            'seed' => $seed,
            'recommendations' => $recommendations ?: [],
        ];
    }

    private function findModel(string $type, int $modelId)
    {
        if ($type === 'artist') {
            return Artist::findOrFail($modelId);
        } elseif ($type === 'genre') {
            return Genre::findOrFail($modelId);
        } elseif ($type === 'track') {
            return Track::with('album.artists', 'artists')->findOrFail(
                $modelId,
            );
        }

        abort(404, 'Invalid radio seed');
    }
}
