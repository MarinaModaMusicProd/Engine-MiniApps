<?php

namespace App\Services\Providers\Deezer;

use App\Models\Artist;
use App\Services\Providers\DataObjects\FetchArtistOptions;
use App\Services\Providers\DataObjects\NormalizedArtist;
use App\Services\Providers\FetchesExternalArtistBio;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;

class DeezerArtist extends DeezerBase
{
    use FetchesExternalArtistBio;

    public function get(
        int $deezerId,
        FetchArtistOptions $options = new FetchArtistOptions(),
        Artist|null $artist = null,
    ): ?NormalizedArtist {
        if (!$deezerId) {
            return null;
        }

        $responses = Http::pool(function (Pool $pool) use (
            $deezerId,
            $options,
            $artist,
        ) {
            $requests = [
                $pool
                    ->as('mainArtist')
                    ->timeout(8)
                    ->get("{$this->baseUrl}/artist/$deezerId"),
                $pool
                    ->as('topTracks')
                    ->timeout(8)
                    ->get("{$this->baseUrl}/artist/$deezerId/top", [
                        'limit' => 20,
                    ]),
            ];

            if ($options->importSimilarArtists) {
                $requests[] = $pool
                    ->as('similar')
                    ->timeout(8)
                    ->get("{$this->baseUrl}/artist/$deezerId/related", [
                        'limit' => 20,
                    ]);
            }

            if ($options->importAlbums) {
                $requests[] = $pool
                    ->as('albums')
                    ->timeout(8)
                    ->get("{$this->baseUrl}/artist/$deezerId/albums", [
                        'limit' => 100,
                    ]);
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
            $this->getResponseData($responses['topTracks'] ?? null)['data'] ??
            null;
        $similarArtists =
            $this->getResponseData($responses['similar'] ?? null)['data'] ??
            null;
        $albums =
            $this->getResponseData($responses['albums'] ?? null)['data'] ??
            null;
        $bioText = $this->getBioResponseData($responses['bio'] ?? null);

        $normalizedArtist = $this->normalizer->artist(
            $mainArtist,
            fullyScraped: true,
            topTracks: $topTracks,
            similarArtists: $similarArtists,
            albums: $albums,
        );
        $normalizedArtist->bioText = $bioText;

        $normalizedArtist->topTracks = array_map(
            fn($item) => $this->normalizer->track(
                $item,
                fullDeezerArtist: $mainArtist,
            ),
            $topTracks ?? [],
        );

        if ($options->importSimilarArtists) {
            $similar = $this->getResponseData($responses['similar'] ?? null);
            $normalizedArtist->similarArtists = array_map(
                fn($item) => $this->normalizer->artist($item),
                Arr::get($similar, 'data', []),
            );
        }

        if ($options->importAlbums) {
            $albums = $this->getResponseData($responses['albums'] ?? null);
            $normalizedArtist->albums = array_map(
                fn($item) => $this->normalizer->album(
                    $item,
                    fullDeezerArtist: $mainArtist,
                ),
                Arr::get($albums, 'data', []),
            );
        }

        return $normalizedArtist;
    }
}
