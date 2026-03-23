<?php

namespace App\Services\Providers\Spotify;

use App\Models\Album;
use App\Services\Providers\DataObjects\NormalizedAlbum;
use App\Services\Providers\DataObjects\NormalizedArtist;
use App\Services\Providers\DataObjects\NormalizedGenre;
use App\Services\Providers\DataObjects\NormalizedPlaylist;
use App\Services\Providers\DataObjects\NormalizedTrack;
use Carbon\Carbon;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class SpotifyNormalizer
{
    public function track(
        array $spotifyTrack,
        ?array $fullSpotifyArtist = null,
        ?array $fullSpotifyAlbum = null,
        ?int $position = null,
    ): NormalizedTrack {
        $artists = [];

        foreach (Arr::get($spotifyTrack, 'artists', []) as $spotifyArtist) {
            $artists[] = $this->artist($spotifyArtist);
        }

        if (
            $fullSpotifyArtist &&
            !Arr::first(
                $artists,
                fn($artist) => $artist->externalId ===
                    Arr::get($fullSpotifyArtist, 'id'),
            )
        ) {
            $artists[] = $this->artist($fullSpotifyArtist);
        }

        $normalizedAlbum = null;
        $spotifyAlbum = $fullSpotifyAlbum ?? Arr::get($spotifyTrack, 'album');
        if ($spotifyAlbum) {
            // Prevent circular references by keeping tracks on the main album only.
            unset($spotifyAlbum['tracks']);
            $normalizedAlbum = $this->album(
                $spotifyAlbum,
                fullSpotifyArtist: $fullSpotifyArtist,
            );
        }

        if (is_null($position)) {
            $position = $spotifyTrack['track_number'] ?? null;
        }

        return new NormalizedTrack(
            externalIdName: 'spotify_id',
            externalId: $spotifyTrack['id'],
            name: Str::limit($spotifyTrack['name'] ?? '', 188),
            duration: $spotifyTrack['duration_ms'] ?? null,
            number: $position,
            popularity: $spotifyTrack['popularity'] ?? null,
            explicit: $spotifyTrack['explicit'] ?? false,
            isrc: $spotifyTrack['external_ids']['isrc'] ?? null,
            album: $normalizedAlbum,
            artists: !empty($artists) ? $artists : null,
            genres: $normalizedAlbum?->genres,
        );
    }

    public function album(
        array $spotifyAlbum,
        bool $fullyScraped = false,
        ?array $fullSpotifyArtist = null,
    ): NormalizedAlbum {
        $artists = [];
        foreach (Arr::get($spotifyAlbum, 'artists', []) as $spotifyArtist) {
            $artists[] = $this->artist($spotifyArtist);
        }

        if (
            $fullSpotifyArtist &&
            !Arr::first(
                $artists,
                fn($artist) => $artist->externalId ===
                    Arr::get($fullSpotifyArtist, 'id'),
            )
        ) {
            $artists[] = $this->artist($fullSpotifyArtist);
        }

        $tracks = null;
        if (Arr::get($spotifyAlbum, 'tracks')) {
            $spotifyTracks =
                Arr::get($spotifyAlbum, 'tracks.items') ??
                Arr::get($spotifyAlbum, 'tracks', []);
            $tracks = array_values(
                array_map(
                    fn($spotifyTrack, $index) => $this->track(
                        $spotifyTrack,
                        fullSpotifyArtist: $fullSpotifyArtist,
                        fullSpotifyAlbum: $spotifyAlbum,
                        position: $index + 1,
                    ),
                    $spotifyTracks,
                    array_keys($spotifyTracks),
                ),
            );
        }

        return new NormalizedAlbum(
            externalIdName: 'spotify_id',
            externalId: $spotifyAlbum['id'] ?? null,
            name: Str::limit($spotifyAlbum['name'] ?? '', 188),
            upc: $spotifyAlbum['external_ids']['upc'] ?? null,
            recordType: $this->normalizeAlbumRecordType(
                $spotifyAlbum['album_type'] ?? null,
            ),
            explicit: $spotifyAlbum['explicit'] ?? false,
            image: $this->getImage($spotifyAlbum['images'] ?? [], 1),
            releaseDate: $spotifyAlbum['release_date'] ?? null,
            popularity: $spotifyAlbum['popularity'] ?? null,
            artists: !empty($artists) ? $artists : null,
            tracks: $tracks,
            fullyScraped: $fullyScraped ?: null,
            updatedAt: $fullyScraped ? Carbon::now()->toDateTimeString() : null,
        );
    }

    public function playlist(array $spotifyPlaylist): NormalizedPlaylist
    {
        return new NormalizedPlaylist(
            externalIdName: 'spotify_id',
            externalId: $spotifyPlaylist['id'],
            name: Str::limit($spotifyPlaylist['name'] ?? '', 188),
            description: Str::limit($spotifyPlaylist['description'] ?? '', 188),
            image: $this->getImage($spotifyPlaylist['images'], 1),
            tracks: array_map(
                fn($playlistTrack) => $this->track($playlistTrack['track']),
                $spotifyPlaylist['tracks']['items'],
            ),
        );
    }

    public function artist(
        array $spotifyArtist,
        bool $fullyScraped = false,
        ?array $topTracks = null,
        ?array $albums = null,
        ?array $similarArtists = null,
    ): NormalizedArtist {
        $normalizedArtist = new NormalizedArtist(
            externalIdName: 'spotify_id',
            externalId: $spotifyArtist['id'],
            name: Str::limit($spotifyArtist['name'] ?? '', 188),
            image: $this->getArtistImage($spotifyArtist),
            popularity: $spotifyArtist['popularity'] ?? null,
            fullyScraped: $fullyScraped ?: null,
            updatedAt: $fullyScraped ? Carbon::now()->toDateTimeString() : null,
            genres: $this->normalizeGenres($spotifyArtist),
        );

        if (!empty($topTracks)) {
            $normalizedArtist->topTracks = array_map(
                fn($item) => $this->track(
                    $item,
                    fullSpotifyArtist: $spotifyArtist,
                ),
                $topTracks,
            );
        }

        if (!empty($albums)) {
            $normalizedArtist->albums = array_map(
                fn($item) => $this->album(
                    $item,
                    fullSpotifyArtist: $spotifyArtist,
                ),
                $albums,
            );
        }

        if (!empty($similarArtists)) {
            $normalizedArtist->similarArtists = array_map(
                fn($item) => $this->artist($item),
                $similarArtists,
            );
        }

        return $normalizedArtist;
    }

    private function getImage(mixed $images, int $index = 0): ?string
    {
        if ($images && count($images)) {
            if (isset($images[$index])) {
                return $images[$index]['url'];
            }

            foreach ($images as $image) {
                return $image['url'];
            }
        }

        return null;
    }

    private function getArtistImage(array $spotifyArtist): ?string
    {
        $images = Arr::get($spotifyArtist, 'images', []);
        $smallImageIndex =
            isset($images[2]) &&
            isset($images[2]['width']) &&
            $images[2]['width'] < 170
                ? 1
                : 2;

        return $this->getImage($images, $smallImageIndex);
    }

    protected function normalizeGenres(array $spotifyItemPayload): ?array
    {
        $normalizedGenres = [];

        foreach (Arr::get($spotifyItemPayload, 'genres', []) as $genreName) {
            $normalizedName = slugify($genreName);
            $normalizedGenres[] = new NormalizedGenre(
                externalIdName: 'spotify_id',
                externalId: null,
                name: $normalizedName,
                displayName: $genreName,
            );
        }

        return !empty($normalizedGenres) ? $normalizedGenres : null;
    }

    protected function normalizeAlbumRecordType(?string $recordType): string
    {
        return match (strtolower((string) $recordType)) {
            'single' => Album::RECORD_TYPE_SINGLE,
            'compilation' => Album::RECORD_TYPE_COMPILATION,
            'ep' => Album::RECORD_TYPE_EP,
            default => Album::RECORD_TYPE_ALBUM,
        };
    }
}
