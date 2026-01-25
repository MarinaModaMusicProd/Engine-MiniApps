<?php namespace App\Services\Providers\Local;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Channel;
use App\Models\Genre;
use App\Models\Playlist;
use App\Models\Tag;
use App\Models\Track;
use App\Models\User;
use App\Services\Albums\AlbumLoader;
use App\Services\Artists\ArtistLoader;
use App\Services\Playlists\PlaylistLoader;
use App\Services\Search\SearchInterface;
use App\Services\Tracks\TrackLoader;
use App\Services\Users\UserProfileLoader;
use App\Traits\BuildsPaginatedApiResources;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class LocalSearch implements SearchInterface
{
    use BuildsPaginatedApiResources;

    protected string $query;
    protected int $perPage;
    protected int $page;

    public function search(
        string $q,
        int $page,
        ?int $perPage = null,
        array $modelTypes,
    ): Collection {
        $this->query = urldecode($q);
        $this->perPage = $perPage ?: 10;
        $this->page = $page;

        $results = collect();

        foreach ($modelTypes as $modelType) {
            if ($modelType === Artist::MODEL_TYPE) {
                $results['artists'] = $this->artists();
            } elseif ($modelType === Album::MODEL_TYPE) {
                $results['albums'] = $this->albums();
            } elseif ($modelType === Track::MODEL_TYPE) {
                $results['tracks'] = $this->tracks();
            } elseif ($modelType === Playlist::MODEL_TYPE) {
                $results['playlists'] = $this->playlists();
            } elseif ($modelType === Channel::MODEL_TYPE) {
                $results['channels'] = $this->channels();
            } elseif ($modelType === Genre::MODEL_TYPE) {
                $results['genres'] = $this->genres();
            } elseif ($modelType === Tag::MODEL_TYPE) {
                $results['tags'] = $this->tags();
            } elseif ($modelType === User::MODEL_TYPE) {
                $results['users'] = $this->users();
            }
        }

        return $results;
    }

    public function artists(): array
    {
        $paginator = Artist::search($this->query)
            ->simplePaginate($this->perPage, 'page', $this->page)
            ->through(
                fn($artist) => (new ArtistLoader())->toApiResource($artist),
            );
        return $this->buildPagination($paginator, $paginator->items());
    }

    public function albums(): array
    {
        $paginator = Album::search($this->query)
            ->simplePaginate($this->perPage, 'page', $this->page)
            ->through(
                fn($album) => (new AlbumLoader())->toApiResource(
                    $album->load(['artists']),
                ),
            );
        return $this->buildPagination($paginator, $paginator->items());
    }

    public function tracks(): array
    {
        $paginator = Track::search($this->query)
            ->simplePaginate($this->perPage, 'page', $this->page)
            ->through(
                fn($track) => (new TrackLoader())->toApiResource(
                    $track->load(['album.artists', 'artists', 'uploadedSrc']),
                ),
            );
        return $this->buildPagination($paginator, $paginator->items());
    }

    public function playlists(): array
    {
        $paginator = Playlist::search($this->query)
            ->simplePaginate($this->perPage, 'page', $this->page)
            ->through(
                fn($playlist) => (new PlaylistLoader())->toApiResource(
                    $playlist->load(['editors']),
                ),
            );
        return $this->buildPagination($paginator, $paginator->items());
    }

    public function channels(): array
    {
        $paginator = app(Channel::class)
            ->search($this->query)
            ->simplePaginate($this->perPage, 'page', $this->page)
            ->through(
                fn(Channel $channel) => $channel->toApiResource($channel),
            );

        return $this->buildPagination($paginator, $paginator->items());
    }

    public function genres(): array
    {
        $paginator = app(Genre::class)->simplePaginate(
            $this->perPage,
            'page',
            $this->page,
        );

        return $this->buildPagination($paginator, $paginator->items());
    }

    public function tags(): array
    {
        $paginator = app(Tag::class)
            ->search($this->query)
            ->simplePaginate($this->perPage, 'page', $this->page);

        return $this->buildPagination($paginator, $paginator->items());
    }

    public function users(): array
    {
        $paginator = app(User::class)
            ->search($this->query)
            ->simplePaginate($this->perPage, 'page', $this->page)
            ->through(
                fn($user) => (new UserProfileLoader())->toApiResource(
                    $user->loadCount('followers')->load(['subscriptions']),
                ),
            );
        return $this->buildPagination($paginator, $paginator->items());
    }
}
