<?php

namespace App\Services\Providers\Deezer;

use App\Services\Providers\DataObjects\NormalizedGenre;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class DeezerGenre extends DeezerBase
{
    public function get(string|null $genreId, string $genreName): ?array
    {
        if (!$genreId) {
            return null;
        }

        $radioGroups = Cache::remember(
            'deezer_genre_radios',
            now()->addDays(3),
            function () {
                $response = $this->getResponseData(
                    Http::timeout(5)->get("{$this->baseUrl}/radio/genres", [
                        'limit' => 50,
                    ]),
                );
                return $response['data'] ?? null;
            },
        );

        // find radio group by genre id
        $radioGroup = null;
        foreach ($radioGroups as $radio) {
            if ($radio['id'] == $genreId) {
                $radioGroup = $radio;
                break;
            }
        }
        if (!$radioGroup) {
            return null;
        }

        // find best radio by name
        $radio = $this->findBestRadio($radioGroup['radios'], $genreName);

        if (!$radio) {
            return null;
        }

        // get radio tracks
        $radioTracks =
            $this->getResponseData(
                Http::timeout(5)->get($radio['tracklist'], [
                    'limit' => 50,
                ]),
            )['data'] ?? [];

        if (empty($radioTracks)) {
            return null;
        }

        $normalizedGenre = new NormalizedGenre(
            externalIdName: 'deezer_id',
            externalId: $genreId,
        );

        $albums = collect($radioTracks)
            ->pluck('album')
            ->map(function (array $item) use ($normalizedGenre) {
                $album = $this->normalizer->album($item);
                $album->genres = [$normalizedGenre];
                return $album;
            })
            ->values();

        $artists = collect($radioTracks)
            ->pluck('artist')
            ->map(function (array $item) use ($normalizedGenre) {
                $artist = $this->normalizer->artist($item);
                $artist->genres = [$normalizedGenre];
                return $artist;
            })
            ->values();

        $tracks = collect($radioTracks)
            ->map(function (array $item) use ($normalizedGenre) {
                $track = $this->normalizer->track($item);
                $track->genres = [$normalizedGenre];
                return $track;
            })
            ->values();

        return [
            'artists' => $artists,
            'albums' => $albums,
            'tracks' => $tracks,
        ];
    }

    protected function findBestRadio(array $radios, string $genreName): ?array
    {
        foreach ($radios as $radio) {
            if (strtolower($radio['title']) === strtolower($genreName)) {
                return $radio;
            }
        }

        foreach ($radios as $radio) {
            if (
                str_contains(
                    strtolower($radio['title']),
                    strtolower($genreName),
                )
            ) {
                return $radio;
            }
        }

        return $radios[0];
    }
}
