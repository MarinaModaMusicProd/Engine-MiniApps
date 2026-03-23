<?php

namespace App\Services\Providers\Deezer;

use App\Services\Providers\DataObjects\NormalizedSearchResults;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;

class DeezerSearch extends DeezerBase
{
    public function search(
        string $q,
        int $page,
        ?int $perPage = null,
        array $modelTypes,
    ): NormalizedSearchResults {
        $query = urldecode($q);
        $perPage = $perPage ?: 10;
        $page = $page;

        $offset = max($page - 1, 0) * $perPage;
        $responses = $this->fetchResponses(
            $query,
            $perPage,
            $offset,
            $modelTypes,
        );

        $data = [
            'artists' => $this->getResponseData($responses['artists'] ?? null),
            'albums' => $this->getResponseData($responses['albums'] ?? null),
            'tracks' => $this->getResponseData($responses['tracks'] ?? null),
        ];

        $normalizedResults = [];

        foreach ($data as $resultsType => $results) {
            $normalizedResults[$resultsType] = [
                'total' => $results['total'] ?? 0,
                'offset' => $offset,
                'data' => collect(),
            ];

            foreach ($results['data'] ?? [] as $result) {
                $normalizedResult = match ($resultsType) {
                    'artists' => $this->normalizer->artist($result),
                    'albums' => $this->normalizer->album($result),
                    'tracks' => $this->normalizer->track($result),
                };
                $normalizedResults[$resultsType]['data']->push(
                    $normalizedResult,
                );
            }
        }

        return new NormalizedSearchResults(
            artists: $normalizedResults['artists'] ?? [],
            albums: $normalizedResults['albums'] ?? [],
            tracks: $normalizedResults['tracks'] ?? [],
        );
    }

    protected function fetchResponses(
        string $query,
        int $perPage,
        int $offset,
        array $modelTypes,
    ): array {
        return Http::pool(function (Pool $pool) use (
            $query,
            $perPage,
            $offset,
            $modelTypes,
        ) {
            $requests = [];

            if (in_array('artist', $modelTypes, true)) {
                $requests[] = $pool
                    ->as('artists')
                    ->timeout(8)
                    ->withUserAgent($this->getUserAgent())
                    ->get("{$this->baseUrl}/search/artist", [
                        'q' => $query,
                        'limit' => $perPage,
                        'index' => $offset,
                    ]);
            }

            if (in_array('album', $modelTypes, true)) {
                $requests[] = $pool
                    ->as('albums')
                    ->timeout(8)
                    ->withUserAgent($this->getUserAgent())
                    ->get("{$this->baseUrl}/search/album", [
                        'q' => $query,
                        'limit' => $perPage,
                        'index' => $offset,
                    ]);
            }

            if (in_array('track', $modelTypes, true)) {
                $requests[] = $pool
                    ->as('tracks')
                    ->timeout(8)
                    ->withUserAgent($this->getUserAgent())
                    ->get("{$this->baseUrl}/search/track", [
                        'q' => $query,
                        'limit' => $perPage,
                        'index' => $offset,
                    ]);
            }

            return $requests;
        });
    }
}
