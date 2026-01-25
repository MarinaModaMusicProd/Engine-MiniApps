<?php namespace App\Services\Providers\Spotify;

use App\Services\Albums\AlbumLoader;
use App\Services\Artists\ArtistLoader;
use App\Services\Providers\Local\LocalSearch;
use App\Services\Search\SearchInterface;
use App\Services\Tracks\TrackLoader;
use Illuminate\Contracts\Pagination\Paginator as PaginatorContract;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

class SpotifySearch extends LocalSearch implements SearchInterface
{
    protected array $formattedResults;

    public function __construct(
        protected SpotifyHttpClient $httpClient,
        protected SpotifyNormalizer $normalizer,
    ) {}

    public function search(
        string $q,
        int $page,
        ?int $perPage = null,
        array $modelTypes,
    ): Collection {
        $this->query = urldecode($q);
        $this->perPage = $perPage ?: 10;
        $this->page = $page;

        $spotifyTypes = collect($modelTypes)->filter(
            fn($type) => in_array($type, ['artist', 'album', 'track']),
        );

        // if searching only local model types, there's no need to call spotify API
        if ($spotifyTypes->isNotEmpty()) {
            $typeString = $spotifyTypes->implode(',');
            $offset = ($page - 1) * $perPage;
            $response = $this->httpClient->get(
                "search?q=$q&type=$typeString&limit=$perPage&offset=$offset",
            );
            $this->formattedResults = $this->formatResponse($response);
            $this->formattedResults = (new SpotifySearchSaver())->save(
                $this->formattedResults,
            );
        }

        return parent::search($q, $page, $perPage, $modelTypes);
    }

    private function formatResponse(array $response): array
    {
        $artists = [
            'items' => collect(Arr::get($response, 'artists.items', []))
                ->filter()
                ->map(
                    fn($spotifyArtist) => $this->normalizer->artist(
                        $spotifyArtist,
                    ),
                ),
            'total' => $response['artists']['total'] ?? 0,
            'offset' => $response['artists']['offset'] ?? 0,
        ];
        $albums = [
            'items' => collect(Arr::get($response, 'albums.items', []))
                ->filter()
                ->map(
                    fn($spotifyAlbum) => $this->normalizer->album(
                        $spotifyAlbum,
                    ),
                ),
            'total' => $response['albums']['total'] ?? 0,
            'offset' => $response['albums']['offset'] ?? 0,
        ];
        $tracks = [
            'items' => collect(Arr::get($response, 'tracks.items', []))
                ->filter(fn($t) => $t && $t['album']['id'])
                ->map(
                    fn($spotifyTrack) => $this->normalizer->track(
                        $spotifyTrack,
                    ),
                ),
            'total' => $response['tracks']['total'] ?? 0,
            'offset' => $response['tracks']['offset'] ?? 0,
        ];
        return [
            'albums' => $albums,
            'tracks' => $tracks,
            'artists' => $artists,
        ];
    }

    public function artists(): array
    {
        if (isset($this->formattedResults['artists']['items'])) {
            return $this->paginator($this->formattedResults['artists']);
        }

        return parent::artists();
    }

    public function albums(): array
    {
        if (isset($this->formattedResults['albums']['items'])) {
            return $this->paginator($this->formattedResults['albums']);
        }

        return parent::albums();
    }

    public function tracks(): array
    {
        if (isset($this->formattedResults['tracks']['items'])) {
            return $this->paginator($this->formattedResults['tracks']);
        }

        return parent::tracks();
    }

    protected function paginator(array $data): array
    {
        $items = collect($data['items']);
        $total = $data['total'];
        $offset = $data['offset'];
        $itemCount = $items->count();
        $hasMorePages = $offset + $itemCount < $total;

        return [
            'data' => $this->itemToApiResource($items),
            'current_page' => $this->page,
            'from' => $itemCount > 0 ? $offset + 1 : null,
            'next_page' => $hasMorePages ? $this->page + 1 : null,
            'per_page' => $this->perPage,
            'prev_page' => $this->page > 1 ? $this->page - 1 : null,
            'to' => $itemCount > 0 ? $offset + $itemCount : null,
        ];
    }

    protected function itemToApiResource(Collection $items): array
    {
        return $items
            ->map(
                fn($item) => match ($item['model_type']) {
                    'artist' => (new ArtistLoader())->toApiResource($item),
                    'album' => (new AlbumLoader())->toApiResource($item),
                    'track' => (new TrackLoader())->toApiResource($item),
                },
            )
            ->toArray();
    }
}
