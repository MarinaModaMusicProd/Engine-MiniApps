<?php

namespace App\Services\Providers\Spotify;

use App\Models\Album;
use App\Services\Providers\DataObjects\NormalizedAlbum;
use App\Services\Providers\DataObjects\NormalizedArtist;
use App\Services\Providers\DataObjects\NormalizedTrack;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class SpotifyCharts
{
    public function getTopArtists(): array|null
    {
        $data = $this->getData('artist');

        if (is_null($data)) {
            return null;
        }

        return array_map(
            fn($entry) => new NormalizedArtist(
                externalIdName: 'spotify_id',
                externalId: $this->spotifyIdFromUri(
                    $entry['artistMetadata']['artistUri'],
                ),
                name: $entry['artistMetadata']['artistName'],
                image: $entry['artistMetadata']['displayImageUri'],
            ),
            $data,
        );
    }

    public function getTopAlbums(): array|null
    {
        $data = $this->getData('album');

        if (is_null($data)) {
            return null;
        }

        return array_map(
            fn($entry) => new NormalizedAlbum(
                externalIdName: 'spotify_id',
                externalId: $this->spotifyIdFromUri(
                    $entry['albumMetadata']['albumUri'],
                ),
                name: $entry['albumMetadata']['albumName'],
                image: $entry['albumMetadata']['displayImageUri'],
                artists: array_map(
                    fn($artistMetadata) => new NormalizedArtist(
                        externalIdName: 'spotify_id',
                        externalId: $this->spotifyIdFromUri(
                            $artistMetadata['spotifyUri'],
                        ),
                        name: $artistMetadata['name'],
                    ),
                    $entry['albumMetadata']['artists'],
                ),
                releaseDate: $entry['albumMetadata']['releaseDate'],
                recordType: Album::RECORD_TYPE_ALBUM,
            ),
            $data,
        );
    }

    public function getTopTracks(): array|null
    {
        $data = $this->getData('track');

        if (is_null($data)) {
            return null;
        }

        return array_map(
            fn($entry) => new NormalizedTrack(
                externalIdName: 'spotify_id',
                externalId: $this->spotifyIdFromUri(
                    $entry['trackMetadata']['trackUri'],
                ),
                name: $entry['trackMetadata']['trackName'],
                image: $entry['trackMetadata']['displayImageUri'],
                artists: array_map(
                    fn($artistMetadata) => new NormalizedArtist(
                        externalIdName: 'spotify_id',
                        externalId: $this->spotifyIdFromUri(
                            $artistMetadata['spotifyUri'],
                        ),
                        name: $artistMetadata['name'],
                    ),
                    $entry['trackMetadata']['artists'],
                ),
            ),
            $data,
        );
    }

    protected function spotifyIdFromUri(string $uri): string
    {
        return explode(':', $uri)[2];
    }

    protected function getData(string $entity): array|null
    {
        $chartData = Cache::remember(
            'charts-spotify-com-service.spotify.com',
            now()->addDays(6),
            function () {
                $response = Http::get(
                    'https://charts-spotify-com-service.spotify.com/public/v0/charts',
                )->json();

                return $response['chartEntryViewResponses'] ?? null;
            },
        );

        if (!is_null($chartData)) {
            $entityData = Arr::first(
                $chartData,
                fn($d) => $d['displayChart']['chartMetadata']['entityType'] ===
                    strtoupper($entity),
            );

            if (isset($entityData['entries'])) {
                return $entityData['entries'];
                // return array_map(
                //     fn($entry) => explode(
                //         ':',
                //         $entry["{$entity}Metadata"]["{$entity}Uri"],
                //     )[2],
                //     $entityData['entries'],
                // );
            }
        }

        return null;
    }
}
