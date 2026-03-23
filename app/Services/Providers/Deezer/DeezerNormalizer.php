<?php

namespace App\Services\Providers\Deezer;

use App\Models\Album;
use App\Services\Providers\DataObjects\NormalizedAlbum;
use App\Services\Providers\DataObjects\NormalizedArtist;
use App\Services\Providers\DataObjects\NormalizedGenre;
use App\Services\Providers\DataObjects\NormalizedPlaylist;
use App\Services\Providers\DataObjects\NormalizedTrack;
use Carbon\Carbon;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class DeezerNormalizer
{
    protected $maxNumberOfFans = 12422969;
    protected $maxNumberofAlbumFans = 1000000;
    protected $maxTrackRank = 1000000;

    protected $genresToSkipForArtist = [
        ['name' => 'films-games', 'id' => 173],
        ['name' => 'film-scores', 'id' => 174],
        ['name' => 'tv-soundtracks', 'id' => 177],
        ['name' => 'game-scores', 'id' => 179],
        ['name' => 'musicals', 'id' => 175],
        ['name' => 'nursery-rhymes', 'id' => 96],
        ['name' => 'stories', 'id' => 97],
        ['name' => 'praise-worship', 'id' => 188],
        ['name' => 'romantic', 'id' => 105],
        ['name' => 'modern', 'id' => 102],
        ['name' => 'dancefloor', 'id' => 114],
    ];

    public function track(
        array $deezerTrack,
        ?array $fullDeezerArtist = null,
        ?array $fullDeezerAlbum = null,
        ?int $position = null,
    ): NormalizedTrack {
        $artists = [];

        $contributors = Arr::get($deezerTrack, 'contributors', []);
        if (!empty($contributors)) {
            foreach ($contributors as $deezerArtist) {
                $artists[] = $this->artist($deezerArtist);
            }
        } elseif (Arr::get($deezerTrack, 'artist')) {
            $artists[] = $this->artist($deezerTrack['artist']);
        }

        if (
            $fullDeezerArtist &&
            !Arr::first(
                $artists,
                fn($a) => (int) $a->externalId ===
                    (int) $fullDeezerArtist['id'],
            )
        ) {
            $artists[] = $this->artist($fullDeezerArtist);
        }

        $normalizedAlbum = null;

        $deezerAlbum = $fullDeezerAlbum ?? ($deezerTrack['album'] ?? null);
        if ($deezerAlbum) {
            // prevent circular reference, tracks should only be present on main album
            unset($deezerAlbum['tracks']);

            $normalizedAlbum = $this->album(
                $deezerAlbum,
                fullDeezerArtist: $fullDeezerArtist,
            );
        }

        // tracks are ordered by position in deezer album api response, so can just use the index,
        // if it's not an album response, try the track_position field
        if (is_null($position)) {
            $position =
                Arr::get($deezerTrack, 'track_position') !== null
                    ? (int) Arr::get($deezerTrack, 'track_position', 0)
                    : null;
        }

        return new NormalizedTrack(
            externalIdName: 'deezer_id',
            externalId: (string) Arr::get($deezerTrack, 'id'),
            name: Str::limit(Arr::get($deezerTrack, 'title', ''), 188),
            duration: Arr::get($deezerTrack, 'duration') !== null
                ? ((int) Arr::get($deezerTrack, 'duration', 0)) * 1000
                : null,
            number: $position,
            explicit: $this->deezerExplicitPropsToBool($deezerTrack),
            popularity: Arr::get($deezerTrack, 'rank') !== null
                ? $this->normalizePopularity(
                    (int) Arr::get($deezerTrack, 'rank'),
                    $this->maxTrackRank,
                )
                : null,
            isrc: $deezerTrack['isrc'] ?? null,
            album: $normalizedAlbum,
            artists: !empty($artists) ? $artists : null,
            genres: $normalizedAlbum ? $normalizedAlbum->genres : null,
        );
    }

    public function album(
        array $deezerAlbum,
        bool $fullyScraped = false,
        ?array $fullDeezerArtist = null,
    ): NormalizedAlbum {
        $recordType = $deezerAlbum['record_type'] ?? null;
        $contributors = $deezerAlbum['contributors'] ?? [];
        $albumGenres = $this->normalizeGenres($deezerAlbum);
        $artists = [];
        $mainArtistId =
            $fullDeezerArtist['id'] ?? ($deezerAlbum['artist']['id'] ?? null);

        if (!empty($contributors)) {
            foreach ($contributors as $deezerArtist) {
                $artist = $this->artist($deezerArtist);
                $artists[] = $artist;
            }
        }

        if (
            isset($deezerAlbum['artist']['id']) &&
            !Arr::first(
                $artists,
                fn($a) => (int) $a->externalId === $deezerAlbum['artist']['id'],
            )
        ) {
            $artists[] = $this->artist($deezerAlbum['artist']);
        }

        // partial deezer album payload might not include contributors
        // or artists, need to specify it manually in that case
        if (
            $fullDeezerArtist &&
            !Arr::first(
                $artists,
                fn($a) => (int) $a->externalId ===
                    (int) $fullDeezerArtist['id'],
            )
        ) {
            $artists[] = $this->artist($fullDeezerArtist);
        }

        // only include genre from album on main artist and only if it's a single and artist is the only credited contributor on that single
        if (
            $mainArtistId &&
            $recordType === Album::RECORD_TYPE_SINGLE &&
            count($contributors) === 1 &&
            Arr::first(
                $contributors,
                fn($c) => (int) $c['id'] === $mainArtistId,
            )
        ) {
            $mainArtist = Arr::first(
                $artists,
                fn($a) => (int) $a->externalId === $mainArtistId,
            );
            if ($mainArtist) {
                $mainArtist->genres = $this->filterGenresForArtist(
                    $albumGenres,
                );
            }
        }

        $tracks = null;
        if (Arr::get($deezerAlbum, 'tracks.data')) {
            $tracks = collect($deezerAlbum['tracks']['data'])
                ->map(
                    fn($deezerTrack, $index) => $this->track(
                        $deezerTrack,
                        fullDeezerArtist: $fullDeezerArtist,
                        fullDeezerAlbum: $deezerAlbum,
                        position: $index + 1,
                    ),
                )
                ->all();
        }

        return new NormalizedAlbum(
            externalIdName: 'deezer_id',
            externalId: (string) Arr::get($deezerAlbum, 'id'),
            name: Str::limit(Arr::get($deezerAlbum, 'title', ''), 188),
            upc: Arr::get($deezerAlbum, 'upc'),
            recordType: $this->normalizeAlbumRecordType(
                Arr::get($deezerAlbum, 'record_type'),
            ),
            explicit: $this->deezerExplicitPropsToBool($deezerAlbum),
            image: Arr::get($deezerAlbum, 'cover_big') ?:
            Arr::get($deezerAlbum, 'cover_medium') ?:
            Arr::get($deezerAlbum, 'cover'),
            releaseDate: Arr::get($deezerAlbum, 'release_date'),
            popularity: isset($deezerAlbum['fans'])
                ? $this->normalizePopularity(
                    (int) $deezerAlbum['fans'],
                    $this->maxNumberofAlbumFans,
                )
                : null,
            artists: !empty($artists) ? $artists : null,
            tracks: $tracks,
            fullyScraped: $fullyScraped ?: null,
            updatedAt: $fullyScraped ? Carbon::now()->toDateTimeString() : null,
            genres: $albumGenres,
        );
    }

    public function artist(
        array $deezerArtist,
        bool $fullyScraped = false,
        ?array $topTracks = null,
        ?array $albums = null,
        ?array $similarArtists = null,
    ): NormalizedArtist {
        $normalizedArtist = new NormalizedArtist(
            externalIdName: 'deezer_id',
            externalId: (string) Arr::get($deezerArtist, 'id'),
            name: Str::limit(Arr::get($deezerArtist, 'name', ''), 188),
            image: Arr::get($deezerArtist, 'picture_big') ?:
            Arr::get($deezerArtist, 'picture_medium') ?:
            Arr::get($deezerArtist, 'picture_xl') ?:
            Arr::get($deezerArtist, 'picture'),
            popularity: isset($deezerArtist['nb_fan'])
                ? $this->normalizePopularity(
                    (int) $deezerArtist['nb_fan'],
                    $this->maxNumberOfFans,
                )
                : null,
            fullyScraped: $fullyScraped ?: null,
            updatedAt: $fullyScraped ? Carbon::now()->toDateTimeString() : null,
        );

        if (!empty($topTracks)) {
            $normalizedArtist->topTracks = array_map(
                fn($item) => $this->track(
                    $item,
                    fullDeezerArtist: $deezerArtist,
                ),
                $topTracks,
            );
        }

        $albumGenres = [];
        if (!empty($albums)) {
            $normalizedArtist->albums = array_map(function ($item) use (
                $deezerArtist,
                &$albumGenres,
            ) {
                $album = $this->album($item, fullDeezerArtist: $deezerArtist);

                // only albums have genres on deezer, attach genres frm albums to artist
                if (!empty($album->genres)) {
                    foreach ($album->genres as $genre) {
                        if (
                            !Arr::first(
                                $albumGenres,
                                fn($g) => $g->externalId === $genre->externalId,
                            )
                        ) {
                            $albumGenres[] = $genre;
                        }
                    }
                }

                return $album;
            }, $albums);

            if (!empty($albumGenres)) {
                $normalizedArtist->genres = $albumGenres;
            }
        }

        if (!empty($similarArtists)) {
            $normalizedArtist->similarArtists = array_map(
                fn($item) => $this->artist($item),
                $similarArtists,
            );
        }

        return $normalizedArtist;
    }

    public function playlist(array $deezerPlaylist): NormalizedPlaylist
    {
        return new NormalizedPlaylist(
            externalIdName: 'deezer_id',
            externalId: $deezerPlaylist['id'],
            name: Str::limit($deezerPlaylist['name'] ?? '', 188),
            description: Str::limit($deezerPlaylist['description'] ?? '', 188),
            image: Arr::get($deezerPlaylist, 'picture_big') ?:
            Arr::get($deezerPlaylist, 'picture_medium') ?:
            Arr::get($deezerPlaylist, 'picture'),
            tracks: array_map(
                fn($playlistTrack) => $this->track($playlistTrack['track']),
                $deezerPlaylist['tracks']['data'],
            ),
        );
    }

    protected function normalizeGenres(array $deezerItemPayload): ?array
    {
        $normalizedGenres = [];

        if (!empty($deezerItemPayload['genres']['data'])) {
            foreach ($deezerItemPayload['genres']['data'] as $genre) {
                $normalizedGenres[] = new NormalizedGenre(
                    externalIdName: 'deezer_id',
                    externalId: $genre['id'],
                    name: slugify($genre['name']),
                    displayName: $genre['name'],
                    image: $genre['picture'] ?? null,
                );
            }
        }

        if (
            isset($deezerItemPayload['genre_id']) &&
            (int) $deezerItemPayload['genre_id'] > 0 &&
            !Arr::first(
                $normalizedGenres,
                fn($g) => $g->externalId == $deezerItemPayload['genre_id'],
            )
        ) {
            $normalizedGenres[] = new NormalizedGenre(
                externalIdName: 'deezer_id',
                externalId: $deezerItemPayload['genre_id'],
            );
        }

        return !empty($normalizedGenres) ? $normalizedGenres : null;
    }

    protected function normalizePopularity(int $value, int $maxValue): int
    {
        $normalizedPopularity = (int) round(($value / $maxValue) * 99) + 1;
        return max(1, min(100, $normalizedPopularity));
    }

    protected function normalizeAlbumRecordType(?string $recordType): string
    {
        return match (strtolower((string) $recordType)) {
            'single' => Album::RECORD_TYPE_SINGLE,
            'ep' => Album::RECORD_TYPE_EP,
            'compilation', 'compile' => Album::RECORD_TYPE_COMPILATION,
            default => Album::RECORD_TYPE_ALBUM,
        };
    }

    protected function deezerExplicitPropsToBool(
        array $deezerAlbumOrTrack,
    ): bool {
        foreach (
            [
                Arr::get($deezerAlbumOrTrack, 'explicit_lyrics'),
                Arr::get($deezerAlbumOrTrack, 'explicit_content_lyrics'),
                Arr::get($deezerAlbumOrTrack, 'explicit_content_cover'),
            ]
            as $value
        ) {
            if ($value === true || $value === 1 || $value === '1') {
                return true;
            }
        }

        return false;
    }

    protected function filterGenresForArtist(?array $genres): ?array
    {
        if (empty($genres)) {
            return null;
        }

        $filteredGenres = array_values(
            array_filter(
                $genres,
                fn(NormalizedGenre $genre) => !$this->shouldSkipGenreForArtist(
                    $genre,
                ),
            ),
        );

        return !empty($filteredGenres) ? $filteredGenres : null;
    }

    protected function shouldSkipGenreForArtist(NormalizedGenre $genre): bool
    {
        $genreId = (int) $genre->externalId;

        foreach ($this->genresToSkipForArtist as $skippedGenre) {
            if (
                ($genreId > 0 && $genreId === $skippedGenre['id']) ||
                ($genre->name !== '' && $genre->name === $skippedGenre['name'])
            ) {
                return true;
            }
        }

        return false;
    }
}
