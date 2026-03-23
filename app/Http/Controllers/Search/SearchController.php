<?php namespace App\Http\Controllers\Search;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Playlist;
use App\Models\Track;
use App\Models\User;
use App\Services\Providers\Youtube\YoutubeAudioSearch;
use App\Services\Search\MainSearch;
use Common\Core\BaseController;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class SearchController extends BaseController
{
    public function index()
    {
        $defaultModelTypes = [
            Artist::MODEL_TYPE,
            Album::MODEL_TYPE,
            Track::MODEL_TYPE,
            User::MODEL_TYPE,
            Playlist::MODEL_TYPE,
        ];
        $loader = request('loader', 'searchPage');
        $perPage = $loader === 'searchPage' ? 20 : 3;
        $query = request()->route('query') ?: request('query');
        $data = [
            'query' => e($query),
            'results' => [],
            'loader' => $loader,
        ];

        if (request('modelTypes')) {
            $modelTypes = explode(',', request('modelTypes'));
        } else {
            $modelTypes = $defaultModelTypes;
        }

        if ($query) {
            $modelTypes = array_filter($modelTypes, function ($modelType) {
                return Gate::inspect(
                    'index',
                    modelTypeToNamespace($modelType),
                )->allowed();
            });

            $data['results'] = (new MainSearch())->execute(
                $query,
                request('page') ?? 1,
                $perPage,
                $modelTypes,
            );
        }

        return $this->renderClientOrApi([
            'pageName' => $loader === 'searchPage' ? 'search-page' : null,
            'data' => $data,
        ]);
    }

    public function searchSingleModelType(string $modelType)
    {
        $this->authorize('index', modelTypeToNamespace($modelType));

        $data = (new MainSearch())->execute(
            request('query'),
            request('page') ?? 1,
            request('perPage') ?? 20,
            [$modelType],
        );

        return $this->success([
            'pagination' => $data[Str::plural($modelType)],
        ]);
    }

    public function searchAudio(
        int $trackId,
        string $artistName,
        string $trackName,
    ) {
        $this->authorize('index', Track::class);

        $results = (new YoutubeAudioSearch())->search(
            $trackId,
            $artistName,
            $trackName,
        );

        return $this->success(['results' => $results]);
    }
}
