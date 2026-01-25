<?php namespace App\Http\Controllers\Search;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Playlist;
use App\Models\Track;
use App\Models\User;
use App\Services\Providers\Local\LocalSearch;
use App\Services\Providers\LocalAndSpotify\LocalAndSpotifySearch;
use App\Services\Providers\Spotify\SpotifySearch;
use App\Services\Providers\Youtube\YoutubeAudioSearch;
use App\Services\Search\SearchInterface;
use Common\Core\BaseController;
use Illuminate\Support\Collection;
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

            $data['results'] = $this->getSearchProvider()->search(
                $query,
                request('page') ?? 1,
                $perPage,
                $modelTypes,
            );

            $data['results'] = $this->filterOutBlockedArtists($data['results']);
        }

        // sort data['results'], by key, tracks first, then albums, then artists, playlists, users
        $data['results'] = collect($data['results'])
            ->sortBy(function ($value, $key) {
                return array_search($key, [
                    'tracks',
                    'artists',
                    'albums',
                    'playlists',
                    'users',
                ]);
            })
            ->toArray();

        return $this->renderClientOrApi([
            'pageName' => $loader === 'searchPage' ? 'search-page' : null,
            'data' => $data,
        ]);
    }

    public function searchSingleModelType(string $modelType)
    {
        $this->authorize('index', modelTypeToNamespace($modelType));

        $data = $this->getSearchProvider()->search(
            request('query'),
            request('page'),
            request('perPage', 20),
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

    /**
     * Remove artists that were blocked by admin from search results.
     */
    private function filterOutBlockedArtists(Collection $results): Collection
    {
        return $results->map(function ($pagination, $type) {
            if ($type === 'artists') {
                $pagination['data'] = array_filter(
                    $pagination['data'],
                    fn($a) => !$a['disabled'],
                );
            }

            if ($type === 'albums') {
                $pagination['data'] = array_filter(
                    $pagination['data'],
                    fn($album) => !array_find(
                        $album['artists'],
                        fn($artist) => $artist['disabled'],
                    ),
                );
            }

            if ($type === 'tracks') {
                $pagination['data'] = array_filter(
                    $pagination['data'],
                    fn($track) => !array_find(
                        $track['artists'],
                        fn($artist) => $artist['disabled'],
                    ),
                );
            }

            return $pagination;
        });
    }

    protected function getSearchProvider(): SearchInterface
    {
        return match (settings('search_provider', 'local')) {
            'local' => new LocalSearch(),
            'spotify' => app(SpotifySearch::class),
            'localAndSpotify' => app(LocalAndSpotifySearch::class),
        };
    }
}
