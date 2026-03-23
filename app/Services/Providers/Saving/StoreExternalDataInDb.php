<?php

namespace App\Services\Providers\Saving;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Genre;
use App\Models\Track;
use App\Services\Providers\DataObjects\NormalizedAlbum;
use App\Services\Providers\DataObjects\NormalizedArtist;
use App\Services\Providers\DataObjects\NormalizedTrack;
use App\Services\Providers\UpsertsDataIntoDB;
use Exception;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StoreExternalDataInDb
{
    use UpsertsDataIntoDB;

    public function __construct(protected string $externalIdName) {}

    /**
     * @param Collection<int, NormalizedArtist>|array<int, NormalizedArtist> $artists
     * @param Collection<int, NormalizedAlbum>|array<int, NormalizedAlbum> $albums
     * @param Collection<int, NormalizedTrack>|array<int, NormalizedTrack> $tracks
     */
    public function execute(
        Collection|array|null $artists = [],
        Collection|array|null $albums = [],
        Collection|array|null $tracks = [],
    ): array {
        // set memory to unlimited
        ini_set('memory_limit', '-1');

        $data = [
            'artists' => collect($artists),
            'albums' => collect($albums),
            'tracks' => collect($tracks),
        ];

        $merged = $this->mergeAndFlattenResults($data);

        // retry 3 times on deadlock
        return DB::transaction(function () use ($merged, $data) {
            return $this->saveAndGetData($merged, $data);
        }, attempts: 3);
    }

    protected function mergeAndFlattenResults(array $data): array
    {
        // expand artist pool first so nested artist data is included
        $data['artists'] = $data['artists']
            ->concat($data['artists']->pluck('similarArtists')->flatten(1))
            ->filter();

        // pull tracks from artists (including similar artists)
        $data['tracks'] = $data['tracks']
            ->concat($data['artists']->pluck('topTracks')->flatten(1))
            ->filter();

        // pull albums from tracks and artists
        $data['albums'] = $data['albums']
            ->concat($data['tracks']->pluck('album'))
            ->concat($data['artists']->pluck('albums')->flatten(1))
            ->filter();

        // pull tracks from albums
        $data['tracks'] = $data['tracks']
            ->concat($data['albums']->pluck('tracks')->flatten(1))
            ->filter();

        // pull artists from albums and tracks
        $data['artists'] = $data['artists']
            ->concat($data['albums']->pluck('artists')->flatten(1))
            ->concat($data['tracks']->pluck('artists')->flatten(1))
            ->filter();

        return $data;
    }

    protected function saveAndGetData(array $merged, array $original): array
    {
        $savedGenres = $this->saveAndGetGenres($merged);
        $savedArtists = $this->saveAndGetArtists($merged['artists']);
        $savedAlbums = $this->saveAndGetAlbums(
            $merged['albums'],
            $savedArtists,
        );
        $savedTracks = $this->saveAndGetTracks(
            $merged['tracks'],
            $savedAlbums,
            $savedArtists,
        );

        $this->attachModelsToGenres(
            $merged,
            [
                'artists' => $savedArtists,
                'albums' => $savedAlbums,
                'tracks' => $savedTracks,
            ],
            $savedGenres,
        );

        return [
            'artists' => $this->filterToOriginals(
                $original['artists'],
                $savedArtists,
            ),
            'albums' => $this->filterToOriginals(
                $original['albums'],
                $savedAlbums,
            ),
            'tracks' => $this->filterToOriginals(
                $original['tracks'],
                $savedTracks,
            ),
        ];
    }

    protected function saveAndGetGenres(array $merged): Collection
    {
        $externalGenreIds = [];
        $genrePayloads = [];
        $externalGenreNames = [];

        // genre array might contain child items with:
        // - only id property
        // - only name and display_name properties
        // - id, name, display_name, image properties

        foreach ($merged as $itemType => $items) {
            foreach ($items as $item) {
                if (empty($item->genres)) {
                    continue;
                }

                foreach ($item->genres as $normalizedGenre) {
                    if (
                        $normalizedGenre->name &&
                        !Arr::first(
                            $genrePayloads,
                            fn($payload) => $payload['name'] ===
                                $normalizedGenre->name,
                        )
                    ) {
                        $genrePayloads[] = $normalizedGenre->toInlineDataArray();
                        if (
                            !in_array(
                                $normalizedGenre->name,
                                $externalGenreNames,
                            )
                        ) {
                            $externalGenreNames[] = $normalizedGenre->name;
                        }
                    }

                    if (
                        $normalizedGenre->externalId &&
                        !in_array(
                            $normalizedGenre->externalId,
                            $externalGenreIds,
                        )
                    ) {
                        $externalGenreIds[] = $normalizedGenre->externalId;
                    }
                }
            }
        }

        if (!empty($genrePayloads)) {
            $this->upsert($genrePayloads, 'genres');
        }

        if (empty($externalGenreIds) && empty($externalGenreNames)) {
            return collect();
        }

        return Genre::when(
            !empty($externalGenreIds),
            fn($query) => $query->whereIn(
                $this->externalIdName,
                $externalGenreIds,
            ),
        )
            ->when(
                !empty($externalGenreNames),
                fn($query) => $query->orWhereIn('name', $externalGenreNames),
            )
            ->get();
    }

    protected function saveAndGetTracks(
        Collection $normalizedTracks,
        Collection $savedAlbums,
        Collection $savedArtists,
    ): Collection {
        $uniqueTracks = $this->deduplicateNormalizedData($normalizedTracks);

        $this->upsert(
            $uniqueTracks->map(function (NormalizedTrack $normalizedTrack) use (
                $savedAlbums,
            ) {
                $normalizedArray = $normalizedTrack->toInlineDataArray();
                $albumId = $savedAlbums
                    ->where(
                        $this->externalIdName,
                        $normalizedTrack->album?->externalId ?? null,
                    )
                    ->first()?->id;
                $normalizedArray['album_id'] = $albumId;

                return $normalizedArray;
            }),
            'tracks',
        );

        $savedTracks = Track::with('album', 'artists')
            ->whereIn($this->externalIdName, $uniqueTracks->pluck('externalId'))
            ->get();

        $pivots = $uniqueTracks
            ->map(function (NormalizedTrack $normalizedTrack) use (
                $savedTracks,
                $savedArtists,
            ) {
                $trackId = $savedTracks
                    ->where($this->externalIdName, $normalizedTrack->externalId)
                    ->first()?->id;
                if (!$trackId) {
                    return null;
                }

                return collect($normalizedTrack->artists ?? [])->map(function (
                    NormalizedArtist $normalizedArtist,
                ) use ($trackId, $savedArtists) {
                    $artistId = $savedArtists
                        ->where(
                            $this->externalIdName,
                            $normalizedArtist->externalId,
                        )
                        ->first()->id;

                    return [
                        'track_id' => $trackId,
                        'artist_id' => $artistId,
                    ];
                });
            })
            ->flatten(1)
            ->filter();

        $this->upsert($pivots, 'artist_track', chunkSize: 300);
        $savedTracks->load('artists', 'album.artists');
        return $savedTracks->values();
    }

    protected function saveAndGetAlbums(
        Collection $uniqueAlbums,
        Collection $savedArtists,
    ): Collection {
        $uniqueAlbums = $this->deduplicateNormalizedData($uniqueAlbums);

        $this->upsert(
            $uniqueAlbums->map(
                fn(NormalizedAlbum $album) => $album->toInlineDataArray(),
            ),
            'albums',
        );

        $savedAlbums = Album::whereIn(
            $this->externalIdName,
            $uniqueAlbums->pluck('externalId'),
        )->get();

        $pivots = $uniqueAlbums
            ->map(function (NormalizedAlbum $normalizedAlbum) use (
                $savedAlbums,
                $savedArtists,
            ) {
                $albumId = $savedAlbums
                    ->where($this->externalIdName, $normalizedAlbum->externalId)
                    ->first()?->id;
                if (!$albumId) {
                    return null;
                }

                return collect($normalizedAlbum->artists ?? [])->map(function (
                    NormalizedArtist $normalizedArtist,
                ) use ($albumId, $savedArtists) {
                    $artistId = $savedArtists
                        ->where(
                            $this->externalIdName,
                            $normalizedArtist->externalId,
                        )
                        ->first()->id;

                    return [
                        'album_id' => $albumId,
                        'artist_id' => $artistId,
                    ];
                });
            })
            ->flatten(1)
            ->filter();

        $this->upsert($pivots, 'artist_album', chunkSize: 300);
        $savedAlbums->load('artists');
        return $savedAlbums;
    }

    protected function saveAndGetArtists(
        Collection $normalizedArtists,
    ): Collection {
        $uniqueArtists = $this->deduplicateNormalizedData($normalizedArtists);

        $this->upsert(
            $uniqueArtists->map(
                fn(NormalizedArtist $artist) => $artist->toInlineDataArray(),
            ),
            'artists',
        );

        $loadedArtists = Artist::whereIn(
            $this->externalIdName,
            $uniqueArtists->pluck('externalId'),
        )->get();

        $similarPivots = $uniqueArtists
            ->map(function (NormalizedArtist $normalizedArtist) use (
                $loadedArtists,
            ) {
                $artistId = $loadedArtists
                    ->where(
                        $this->externalIdName,
                        $normalizedArtist->externalId,
                    )
                    ->first()?->id;
                if (!$artistId) {
                    return null;
                }

                return collect($normalizedArtist->similarArtists ?? [])->map(
                    function (NormalizedArtist $normalizedSimilarArtist) use (
                        $artistId,
                        $loadedArtists,
                    ) {
                        $similarId = $loadedArtists
                            ->where(
                                $this->externalIdName,
                                $normalizedSimilarArtist->externalId,
                            )
                            ->first()?->id;

                        if (!$similarId) {
                            return null;
                        }

                        return [
                            'artist_id' => $artistId,
                            'similar_id' => $similarId,
                        ];
                    },
                );
            })
            ->flatten(1)
            ->filter();

        if ($similarPivots->isNotEmpty()) {
            $this->upsert($similarPivots, 'similar_artists', chunkSize: 300);
        }

        return $loadedArtists->values();
    }

    // deduplicate artist/album/track array by externalId and also merge data from duplicate items, so if one is partial and other is full, it will have props from both.
    protected function deduplicateNormalizedData(Collection $items): Collection
    {
        $uniqueItems = collect();

        foreach ($items as $item) {
            if ($item->externalId === null) {
                continue;
            }

            if (!isset($uniqueItems[$item->externalId])) {
                $uniqueItems[$item->externalId] = $item;
                continue;
            }

            $uniqueItem = $uniqueItems[$item->externalId];

            foreach ($item as $key => $value) {
                if ($key === $this->externalIdName || is_iterable($value)) {
                    continue;
                }

                if (!is_null($value) && is_null($uniqueItem->{$key})) {
                    $uniqueItem->{$key} = $value;
                }
            }
        }

        return $uniqueItems->values();
    }

    protected function filterToOriginals(
        Collection $originalItems,
        Collection $savedItems,
    ): Collection {
        return $originalItems
            ->map(
                fn($originalItem) => $savedItems
                    ->where($this->externalIdName, $originalItem->externalId)
                    ->first(),
            )
            ->filter()
            ->values();
    }

    protected function attachModelsToGenres(
        array $normalizedItems,
        array $savedModels,
        Collection $savedGenres,
    ) {
        $genreablesPivots = [];

        foreach ($normalizedItems as $itemType => $items) {
            foreach ($items as $item) {
                if (empty($item->genres)) {
                    continue;
                }

                // resolve model for normalized item
                $itemModel = $savedModels[$itemType]
                    ->where($this->externalIdName, $item->externalId)
                    ->first();
                if (!$itemModel) {
                    continue;
                }

                foreach ($item->genres as $normalizedGenre) {
                    // resolve genre model
                    $genreModel = $savedGenres
                        ->when(
                            $normalizedGenre->externalId,
                            fn($query) => $query->where(
                                $this->externalIdName,
                                $normalizedGenre->externalId,
                            ),
                            fn($query) => $query->where(
                                'name',
                                $normalizedGenre->name,
                            ),
                        )
                        ->first();
                    if (!$genreModel) {
                        continue;
                    }

                    // check for duplicates
                    if (
                        Arr::first(
                            fn($pivot) => $pivot['genre_id'] ===
                                $genreModel->id &&
                                $pivot['genreable_id'] === $itemModel->id &&
                                $pivot['genreable_type'] ===
                                    $itemModel::MODEL_TYPE,
                        )
                    ) {
                        continue;
                    }

                    $genreablesPivots[] = [
                        'genre_id' => $genreModel->id,
                        'genreable_id' => $itemModel->id,
                        'genreable_type' => $itemModel::MODEL_TYPE,
                    ];
                }
            }
        }

        if (!empty($genreablesPivots)) {
            $this->upsert($genreablesPivots, 'genreables', chunkSize: 300);
        }
    }
}
