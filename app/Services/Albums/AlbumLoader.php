<?php

namespace App\Services\Albums;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Genre;
use App\Models\Track;
use App\Services\Artists\ArtistLoader;
use App\Services\Genres\GenreToApiResource;
use App\Services\Tracks\TrackLoader;
use Common\Tags\Tag;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AlbumLoader
{
    public function load(Album $album, string $loader): array
    {
        if ($album->artists->some(fn($artist) => $artist->disabled)) {
            abort(404);
        }

        // sync album data with spotify, if needed by this loader
        if ($loader === 'albumPage' && $album->needsUpdating()) {
            $album = (new SyncAlbumWithSpotify())->execute($album);
        }

        if ($loader === 'albumPage' || $loader === 'editAlbumPage') {
            $album->load(['tags', 'genres', 'artists']);
            $album->loadCount(['reposts', 'likes']);
            $this->loadFullTracks($album);
            $album->tracks_count = count($album->tracks);
        }

        if ($album->relationLoaded('tracks')) {
            $album->addPopularityToTracks();
        }

        return [
            'loader' => $loader,
            'album' => $this->toApiResource($album, $loader),
        ];
    }

    public function toApiResource(
        Album $album,
        string|null $loader = null,
    ): array {
        $resource = [
            'id' => $album->id,
            'name' => $album->name,
            'image' => $album->image,
            'release_date' => $album->release_date?->toJSON(),
            'model_type' => $album->model_type,
            'plays' => $album->plays,
            'views' => $album->views,
            'owner_id' => $album->owner_id,
            'created_at' => $album->created_at?->toJSON(),
            'artists' => $album->artists->isNotEmpty()
                ? $album->artists
                    ->map(
                        fn(
                            Artist $artist,
                        ) => (new ArtistLoader())->toApiResource($artist),
                    )
                    ->toArray()
                : [(new ArtistLoader())->getFallbackPartialArtist()],
        ];

        if (
            $loader === 'editAlbumPage' ||
            $loader === 'editAlbumDatatable' ||
            $loader === 'albumPage'
        ) {
            $resource['updated_at'] = $album->updated_at?->toJSON();
            $resource['spotify_id'] = $album->spotify_id;
        }

        if ($loader === 'editAlbumPage' || $loader === 'albumPage') {
            $resource['description'] = $album->description;
        }

        if ($album->tracks_count !== null) {
            $resource['tracks_count'] = $album->tracks_count;
        }

        if ($album->reposts_count !== null) {
            $resource['reposts_count'] = $album->reposts_count;
        }

        if ($album->likes_count !== null) {
            $resource['likes_count'] = $album->likes_count;
        }

        if ($album->comments_count !== null) {
            $resource['comments_count'] = $album->comments_count;
        }

        if ($album->relationLoaded('tracks')) {
            $resource['tracks'] = $album->tracks
                ->map(
                    fn(Track $track) => (new TrackLoader())->toApiResource(
                        $track,
                        loader: $loader === 'editAlbumPage'
                            ? 'editTrackPage'
                            : null,
                        album: $album,
                    ),
                )
                ->toArray();
        }

        if ($album->relationLoaded('tags')) {
            $resource['tags'] = $album->tags
                ->map(
                    fn(Tag $tag) => [
                        'id' => $tag->id,
                        'name' => $tag->name,
                        'display_name' => $tag->display_name,
                    ],
                )
                ->toArray();
        }

        if ($album->relationLoaded('genres')) {
            $resource['genres'] = $album->genres
                ->map(
                    fn(Genre $genre) => (new GenreToApiResource())->execute(
                        $genre,
                    ),
                )
                ->toArray();
        }

        return $resource;
    }

    protected function loadFullTracks(Album $album): void
    {
        $album->load([
            'tracks' => fn(HasMany $builder) => $builder->with([
                'artists',
                'tags',
                'genres',
                'uploadedSrc',
            ]),
        ]);
    }
}
