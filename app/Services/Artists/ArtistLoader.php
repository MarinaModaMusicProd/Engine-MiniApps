<?php

namespace App\Services\Artists;

use App\Models\Artist;
use App\Models\Genre;
use App\Models\ProfileImage;
use App\Models\ProfileLink;
use App\Models\Track;
use App\Models\User;
use App\Services\Albums\PaginateAlbums;
use App\Services\Genres\GenreToApiResource;
use App\Services\Tracks\PaginateTracks;
use App\Services\Tracks\TrackLoader;
use App\Services\Users\UserProfileLoader;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Arr;

class ArtistLoader
{
    public static array $artistPageTabs = [
        'discography' => 1,
        'similar' => 2,
        'about' => 3,
        'tracks' => 4,
        'albums' => 5,
        'followers' => 6,
    ];

    public function load(Artist $artist, string $loader): array
    {
        if ($artist->disabled && $loader !== 'editArtistPage') {
            abort(404);
        }

        $response = [
            'artist' => $artist,
            'loader' => $loader,
            'selectedAlbumViewMode' => Arr::get(
                $_COOKIE,
                'artistPage-albumViewMode',
                settings('player.default_artist_view', 'list'),
            ),
        ];

        if ($loader === 'artistPage') {
            if ($artist->needsUpdating()) {
                $newArtist = (new SyncArtistWithSpotify())->execute($artist);
                $response['artist'] = $newArtist ?? $artist;
            }
            $response = $this->loadTopTracks($response);
            $response = $this->loadSimilar($response);
            $response = $this->loadProfile($response);
            $response['artist']->load(['genres']);
            $response['artist']->loadCount(['likes']);
            $response = $this->loadActiveTabData($response);
        } elseif ($loader === 'editArtistPage') {
            $response = $this->loadEditPageAlbums($response);
            $response = $this->loadProfile($response);
            $response['artist']->load(['genres']);
        }

        $response['artist'] = $this->toApiResource(
            $response['artist'],
            $loader,
        );
        return $response;
    }

    public function toApiResource(
        Artist $artist,
        string|null $loader = 'artist',
    ): array {
        $resource = [
            'id' => $artist->id,
            'name' => $artist->name,
            'image_small' => $artist->image_small,
            'verified' => $artist->verified,
            'disabled' => $artist->disabled,
            'model_type' => $artist->model_type,
        ];

        if ($loader !== 'artist') {
            $resource['spotify_id'] = $artist->spotify_id;
            $resource['created_at'] = $artist->updated_at?->toJSON();
            $resource['updated_at'] = $artist->updated_at?->toJSON();
            $resource['views'] = $artist->views;
            $resource['plays'] = $artist->plays;
            $resource['disabled'] = $artist->disabled;
        }

        if ($artist->relationLoaded('genres')) {
            $resource['genres'] = $artist->genres
                ->map(
                    fn(Genre $genre) => (new GenreToApiResource())->execute(
                        $genre,
                    ),
                )
                ->toArray();
        }

        if ($artist->relationLoaded('topTracks')) {
            $resource['top_tracks'] = $artist->topTracks
                ->map(
                    fn(Track $track) => (new TrackLoader())->toApiResource(
                        $track,
                    ),
                )
                ->toArray();
        }

        if ($artist->relationLoaded('similar')) {
            $resource['similar'] = $artist->similar
                ->map(fn(Artist $similar) => $this->toApiResource($similar))
                ->toArray();
        }

        if ($artist->relationLoaded('profile')) {
            $resource['profile'] = [
                'city' => $artist->profile?->city,
                'country' => $artist->profile?->country,
                'description' => $artist->profile?->description,
            ];
        }

        if ($artist->relationLoaded('profileImages')) {
            $resource['profile_images'] = $artist->profileImages
                ->map(
                    fn(ProfileImage $image) => [
                        'url' => $image->url,
                        'id' => $image->id,
                    ],
                )
                ->toArray();
        }

        if ($artist->relationLoaded('links')) {
            $resource['links'] = $artist->links
                ->map(
                    fn(ProfileLink $link) => [
                        'url' => $link->url,
                        'title' => $link->title,
                    ],
                )
                ->toArray();
        }

        if ($artist->likes_count !== null) {
            $resource['likes_count'] = $artist->likes_count;
        }

        if ($artist->albums_count !== null) {
            $resource['albums_count'] = $artist->albums_count;
        }

        if ($artist->followers_count !== null) {
            $resource['followers_count'] = $artist->followers_count;
        }

        return $resource;
    }

    protected function loadActiveTabData(array $response): array
    {
        $tabIds = collect(settings('artistPage.tabs'))
            ->filter(fn($tab) => $tab['active'])
            ->map(fn($tab) => (int) $tab['id']);

        $activeTabName = request('tab');
        $activeTabId = static::$artistPageTabs[$activeTabName] ?? null;
        $activeTabId =
            !$activeTabId || !$tabIds->contains($activeTabId)
                ? $tabIds[0]
                : $activeTabId;

        if ($activeTabId === static::$artistPageTabs['tracks']) {
            $response['tracks'] = $this->paginateArtistTracks(
                $response['artist'],
            );
            return $response;
        }

        if ($activeTabId === static::$artistPageTabs['discography']) {
            $response['albums'] = $this->paginateArtistAlbums(
                $response['artist'],
                viewMode: $response['selectedAlbumViewMode'],
            );
            return $response;
        }

        if ($activeTabId === static::$artistPageTabs['albums']) {
            $response['albums'] = $this->paginateArtistAlbums(
                $response['artist'],
                viewMode: 'list',
            );
            return $response;
        }

        if ($activeTabId === static::$artistPageTabs['followers']) {
            $response['followers'] = $this->loadArtistFollowers(
                $response['artist'],
            );
            return $response;
        }

        return $response;
    }

    protected function loadTopTracks(array $response)
    {
        $response['top_tracks'] = $response['artist']
            ->tracks()
            ->orderByPopularity('desc')
            ->with(['album.artists', 'artists'])
            ->limit(20)
            ->get()
            ->map(
                fn(Track $track) => (new TrackLoader())->toApiResource($track),
            )
            ->toArray();
        return $response;
    }

    protected function loadProfile(array $response): array
    {
        $response['artist']->load(['profile', 'profileImages', 'links']);
        return $response;
    }

    protected function loadEditPageAlbums(array $response): array
    {
        $response['albums'] = $this->paginateArtistAlbums(
            $response['artist'],
            viewMode: 'grid',
            perPage: 50,
            includeScheduled: true,
            loader: 'editArtistPage',
        );
        return $response;
    }

    protected function loadSimilar(array $response): array
    {
        if (
            settings('artist_provider') !== 'spotify' ||
            !config('services.spotify.use_deprecated_api')
        ) {
            $similar = (new GetSimilarArtists())->execute($response['artist']);
            $response['artist']->setRelation('similar', $similar);
        } else {
            $response['artist']->load('similar');
        }
        return $response;
    }

    public function paginateArtistAlbums(
        Artist $artist,
        string $viewMode = 'grid',
        int|null $perPage = null,
        bool $includeScheduled = false,
        string|null $loader = null,
        int|null $page = 1,
    ): array {
        $finalPerPage = $perPage ?? ($viewMode === 'list' ? 5 : 25);
        return (new PaginateAlbums())->asApiResponse(
            [
                'perPage' => $finalPerPage,
                'order' => 'singlesLast',
                'paginate' => 'simple',
                'page' => $page,
            ],
            $artist->albums(),
            includeScheduled: $includeScheduled,
            includeTracks: $viewMode === 'list',
            loader: $loader,
        );
    }

    public function paginateArtistTracks(
        Artist $artist,
        int|null $page = 1,
    ): array {
        return (new PaginateTracks())->asApiResponse(
            [
                'perPage' => request('perPage', 20),
                'order' => 'popularity',
                'paginate' => 'simple',
                'page' => $page,
            ],
            $artist->tracks(),
        );
    }

    public function loadArtistFollowers(Artist $artist)
    {
        return $artist
            ->followers()
            ->with(['subscriptions'])
            ->withCount(['followers'])
            ->simplePaginate(25)
            ->through(
                fn($user) => (new UserProfileLoader())->toApiResource($user),
            );
    }

    public function getFallbackPartialArtist(): array
    {
        return [
            'id' => 0,
            'name' => __('Unknown Artist'),
            'image_small' => null,
            'verified' => false,
        ];
    }
}
