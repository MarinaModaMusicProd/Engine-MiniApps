<?php

namespace App\Services\Providers\Spotify;

use App\Models\Artist;
use App\Services\Providers\DataObjects\FetchArtistOptions;
use App\Services\Providers\DataObjects\NormalizedArtist;
use App\Services\Providers\FetchesExternalArtistBio;
use App\Traits\AuthorizesWithSpotify;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;

class SpotifyArtist extends SpotifyBase
{
    use AuthorizesWithSpotify, FetchesExternalArtistBio;

    public function get(
        string $spotifyId,
        FetchArtistOptions $options = new FetchArtistOptions(),
        Artist|null $artist = null,
    ): ?NormalizedArtist {
        if (!$spotifyId) {
            return null;
        }

        $spotifyToken = $this->authorize();

        $responses = Http::pool(function (Pool $pool) use (
            $spotifyId,
            $spotifyToken,
            $options,
            $artist,
        ) {
            $requests = [
                $pool
                    ->as('mainArtist')
                    ->withHeaders(['Authorization' => "Bearer $spotifyToken"])
                    ->get("{$this->baseUrl}/artists/$spotifyId"),
            ];

            if (config('services.spotify.use_deprecated_api')) {
                $requests[] = $pool
                    ->as('topTracks')
                    ->withHeaders(['Authorization' => "Bearer $spotifyToken"])
                    ->get(
                        "{$this->baseUrl}/artists/$spotifyId/top-tracks?market=US",
                    );
            }

            if ($options->importAlbums) {
                $requests[] = $pool
                    ->as('partialAlbumsFirstPage')
                    ->withHeaders(['Authorization' => "Bearer $spotifyToken"])
                    ->get(
                        "{$this->baseUrl}/artists/$spotifyId/albums?offset=0&limit=50",
                    );
                $requests[] = $pool
                    ->as('partialAlbumsSecondPage')
                    ->withHeaders(['Authorization' => "Bearer $spotifyToken"])
                    ->get(
                        "{$this->baseUrl}/artists/$spotifyId/albums?offset=50&limit=50",
                    );
            }

            if (
                $options->importSimilarArtists &&
                config('services.spotify.use_deprecated_api')
            ) {
                $requests[] = $pool
                    ->as('similarArtists')
                    ->withHeaders(['Authorization' => "Bearer $spotifyToken"])
                    ->get(
                        "{$this->baseUrl}/artists/$spotifyId/related-artists",
                    );
            }

            if (
                $artist &&
                ($bioRequest = $this->fetchArtistBio($artist, $pool))
            ) {
                $requests[] = $bioRequest;
            }

            return $requests;
        });

        $mainArtist = $this->getResponseData($responses['mainArtist'] ?? null);
        if (!Arr::get($mainArtist, 'id')) {
            return null;
        }

        $topTracks =
            $this->getResponseData($responses['topTracks'] ?? null)['tracks'] ??
            null;
        $similarArtists =
            $this->getResponseData($responses['similarArtists'] ?? null)[
                'artists'
            ] ?? null;
        $partialAlbums = array_merge(
            $this->getResponseData(
                $responses['partialAlbumsFirstPage'] ?? null,
            )['items'] ?? [],
            $this->getResponseData(
                $responses['partialAlbumsSecondPage'] ?? null,
            )['items'] ?? [],
        );
        $bioText = $this->getBioResponseData($responses['bio'] ?? null);

        // Spotify occasionally includes unrelated albums in this endpoint.
        if (!empty($partialAlbums)) {
            $partialAlbums = array_values(
                array_filter(
                    $partialAlbums,
                    fn($partialAlbum) => array_find(
                        Arr::get($partialAlbum, 'artists', []),
                        fn($partialAlbumArtist) => $spotifyId ===
                            Arr::get($partialAlbumArtist, 'id'),
                    ),
                ),
            );
        }

        $normalizedArtist = $this->normalizer->artist(
            $mainArtist,
            fullyScraped: true,
            topTracks: $topTracks,
            albums: $partialAlbums,
            similarArtists: $similarArtists,
        );
        $normalizedArtist->bioText = $bioText;

        return $normalizedArtist;
    }
}
