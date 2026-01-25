<?php

namespace App\Services\Tracks;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Genre;
use App\Models\Track;
use App\Services\Albums\AlbumLoader;
use App\Services\Artists\ArtistLoader;
use App\Services\Genres\GenreToApiResource;
use Common\Files\Uploads\Uploads;
use Common\Tags\Tag;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class TrackLoader
{
    public function load(Track $track, string|null $loader = null): array
    {
        if ($track->artists->some(fn($artist) => $artist->disabled)) {
            abort(404);
        }

        $track->load('uploadedSrc');

        if ($loader === 'trackPage' || $loader === 'editTrackPage') {
            $track->load(['tags', 'genres', 'artists']);
            $track->loadCount(['reposts', 'likes']);
            $this->loadFullAlbum($track);
        }

        if (
            $track->relationLoaded('album') &&
            $track->album &&
            $track->album->relationLoaded('tracks')
        ) {
            $track->album->addPopularityToTracks();
        }

        return [
            'loader' => $loader,
            'track' => $this->toApiResource($track, $loader),
        ];
    }

    public function toApiResource(
        Track $track,
        string|null $loader = null,
        Album|null $album = null,
    ): array {
        // artists either as normalized array or partial api resource, based on loader
        if ($loader === 'editTrackPage') {
            $artists = $track->artists
                ->map(fn(Artist $artist) => $artist->toNormalizedArray())
                ->toArray();
        } else {
            $artists = $track->artists->isEmpty()
                ? [(new ArtistLoader())->getFallbackPartialArtist()]
                : $track->artists
                    ->map(
                        fn(
                            Artist $artist,
                        ) => (new ArtistLoader())->toApiResource($artist),
                    )
                    ->toArray();
        }

        // base track data, needed everywhere
        $resource = [
            'id' => $track->id,
            'name' => $track->name,
            'image' => $this->resolveImage($track, $album),
            'number' => $track->number,
            'duration' => $track->duration,
            'plays' => $track->plays,
            'popularity' => $track->popularity ?? 0,
            'owner_id' => $track->owner_id,
            'created_at' => $track->created_at?->toJSON(),
            'model_type' => $track->model_type,
            'artists' => $artists,
        ];

        if ($track->added_at !== null) {
            $resource['added_at'] = $track->added_at?->toJSON();
        }

        if ($loader === 'editTrackPage' || $loader === 'editTrackDatatable') {
            $resource['updated_at'] = $track->updated_at?->toJSON();
            $resource['spotify_id'] = $track->spotify_id;
        }

        if ($loader === 'editTrackPage' || $loader === 'trackPage') {
            $resource['description'] = $track->description;
        }

        if ($track->relationLoaded('album')) {
            $resource['album'] = $track->album
                ? (new AlbumLoader())->toApiResource($track->album)
                : null;
        }

        if ($track->relationLoaded('tags')) {
            $resource['tags'] =
                $loader === 'editTrackPage'
                    ? $track->tags
                        ->map(fn(Tag $tag) => $tag->toNormalizedArray())
                        ->toArray()
                    : $track->tags
                        ->map(
                            fn(Tag $tag) => [
                                'id' => $tag->id,
                                'name' => $tag->name,
                                'display_name' => $tag->display_name,
                            ],
                        )
                        ->toArray();
        }

        if ($track->relationLoaded('genres')) {
            $resource['genres'] =
                $loader === 'editTrackPage'
                    ? $track->genres
                        ->map(fn(Genre $genre) => $genre->toNormalizedArray())
                        ->toArray()
                    : $track->genres
                        ->map(
                            fn(
                                Genre $genre,
                            ) => (new GenreToApiResource())->execute($genre),
                        )
                        ->toArray();
        }

        if ($track->relationLoaded('lyric') && $track->lyric) {
            $resource['lyric'] = $track->lyric->toArray();
        }

        // set "src_local" so we know on frontend if track is locally uploaded
        // and update "src" based on file entry backend so custom domain is reflected
        if (requestIsFromFrontend() || Auth::user()?->hasPermission('admin')) {
            $resource['src'] = $track->src;
            $resource['src_local'] = false;

            if (config('app.demo')) {
                $resource['src_local'] = Str::startsWith(
                    $track->src,
                    'tracks/',
                );
            }

            // support legacy uploads
            if (Str::startsWith($track->src, 'storage/track-media')) {
                $resource['src_local'] = true;
            }

            if (
                $track->relationLoaded('uploadedSrc') &&
                $loader !== 'editTrackPage' &&
                !$resource['src_local']
            ) {
                $fileEntry = $track->uploadedSrc->first();
                if ($fileEntry?->upload_type) {
                    $resource['src_local'] = true;
                    $resource['src'] = Uploads::type(
                        $fileEntry->upload_type,
                    )->url($fileEntry);
                }
            }
        }

        if ($track->likes_count !== null) {
            $resource['likes_count'] = $track->likes_count;
        }

        if ($track->reposts_count !== null) {
            $resource['reposts_count'] = $track->reposts_count;
        }

        if ($track->comments_count !== null) {
            $resource['comments_count'] = $track->comments_count;
        }

        return $resource;
    }

    protected function loadFullAlbum(Track $track)
    {
        $track->load([
            'album' => fn(BelongsTo $builder) => $builder->with([
                'artists',
                'tracks.artists',
            ]),
        ]);
    }

    protected function resolveImage(
        Track $track,
        Album|null $album = null,
    ): string|null {
        if ($track->image) {
            return $track->image;
        }

        if ($album?->image) {
            return $album->image;
        }

        if ($track->relationLoaded('album') && $track->album?->image) {
            return $track->album->image;
        }

        return null;
    }
}
