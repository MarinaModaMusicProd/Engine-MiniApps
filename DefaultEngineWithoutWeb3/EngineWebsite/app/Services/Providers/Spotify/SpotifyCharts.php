<?php

namespace App\Services\Providers\Spotify;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class SpotifyCharts
{
    public function getArtistIds(): array|null
    {
        return $this->getData('artist');
    }

    public function getAlbumIds(): array|null
    {
        return $this->getData('album');
    }

    public function getTrackIds(): array|null
    {
        return $this->getData('track');
    }

    protected function getData(string $entity): array|null
    {
        $data = Cache::remember(
            'charts-spotify-com-service.spotify.com',
            now()->addDays(6),
            function () {
                $response = Http::get(
                    'https://charts-spotify-com-service.spotify.com/public/v0/charts',
                )->json();

                return $response['chartEntryViewResponses'] ?? null;
            },
        );

        if (!is_null($data)) {
            $entityData = Arr::first(
                $data,
                fn($d) => $d['displayChart']['chartMetadata']['entityType'] ===
                    strtoupper($entity),
            );

            if (isset($entityData['entries'])) {
                return array_map(
                    fn($entry) => explode(
                        ':',
                        $entry["{$entity}Metadata"]["{$entity}Uri"],
                    )[2],
                    $entityData['entries'],
                );
            }
        }

        return null;
    }
}
