<?php namespace App\Services\Providers\Spotify;

use App\Services\Providers\DataObjects\NormalizedSearchResults;
use App\Traits\AuthorizesWithSpotify;
use Illuminate\Support\Facades\Http;

class SpotifySearch extends SpotifyBase
{
    use AuthorizesWithSpotify;

    public function search(
        string $q,
        int $page,
        ?int $perPage = null,
        array $modelTypes,
    ): NormalizedSearchResults {
        $query = urldecode($q);
        $perPage = $perPage ?: 10;
        $page = $page;

        $typeString = implode(',', $modelTypes);
        $offset = ($page - 1) * $perPage;
        $response = Http::withToken($this->authorize())->get(
            "{$this->baseUrl}/search?q=$query&type=$typeString&limit=$perPage&offset=$offset",
        );

        $data = $this->getResponseData($response) ?? [];

        $normalizedResults = [];

        foreach ($data as $resultsType => $results) {
            // update per page, in case spotify maximum limit is lower then specified per page.
            $perPage = $results['limit'] ?? $perPage;

            $normalizedResults[$resultsType] = [
                'total' => $results['total'] ?? 0,
                'offset' => $results['offset'] ?? 0,
                'data' => collect(),
            ];

            foreach ($results['items'] as $result) {
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
            artists: $normalizedResults['artists'] ?? null,
            albums: $normalizedResults['albums'] ?? null,
            tracks: $normalizedResults['tracks'] ?? null,
        );
    }
}
