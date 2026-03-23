<?php namespace App\Services\Providers;

use App\Models\Artist;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Str;
use GuzzleHttp\Promise\Promise;
use Illuminate\Support\Facades\Log;

trait FetchesExternalArtistBio
{
    public function fetchArtistBio(Artist $artist, Pool $pool): Promise|null
    {
        $provider = settings('artist_bio_provider', 'wikipedia');

        if ($provider === 'wikipedia') {
            return $this->fetchFromWikipedia($artist, $pool);
        }

        return null;
    }

    private function fetchFromWikipedia(Artist $artist, Pool $pool): Promise
    {
        return $pool
            ->as('bio')
            ->withUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
            )
            ->get(
                $this->makeWikipediaApiUrl(
                    $artist->name,
                    settings('wikipedia_language', 'en'),
                ),
            );
    }

    private function getBioResponseData(?Response $response): string|null
    {
        if (!$response?->successful()) {
            if (
                $response &&
                str_contains(
                    $response->body(),
                    'You are making too many requests',
                )
            ) {
                Log::channel('remoteApiErrors')->error(
                    'Wikipedia API rate limit exceeded',
                );
            } else {
                Log::error('Wikipedia API error: ' . $response?->body());
            }
            return null;
        }

        if (!isset($response['query']['pages'])) {
            return null;
        }

        $response = $response['query']['pages'];
        if (!is_array($response) || empty($response)) {
            return null;
        }

        foreach ($response as $page) {
            if (
                Str::contains($page['title'], 'singer') &&
                isset($page['extract']) &&
                $page['extract']
            ) {
                return $page['extract'];
            }
            if (
                Str::contains($page['title'], 'band') &&
                isset($page['extract']) &&
                $page['extract']
            ) {
                return $page['extract'];
            }
            if (
                Str::contains($page['title'], 'rapper') &&
                isset($page['extract']) &&
                $page['extract']
            ) {
                return $page['extract'];
            }
        }

        $length = 0;
        $longest = '';

        foreach ($response as $page) {
            if (isset($page['extract']) && $page['extract']) {
                if (strlen($page['extract']) > $length) {
                    $length = strlen($page['extract']);
                    $longest = $page['extract'];
                }
            }
        }

        return $longest;
    }

    private function makeWikipediaApiUrl(
        string $name,
        string $lang = 'en',
    ): string {
        $name = str_replace(' ', '_', ucwords(strtolower($name)));

        $titles =
            "$name|" .
            $name .
            '_(rapper)|' .
            $name .
            '_(band)|' .
            $name .
            '_(singer)';

        return "https://$lang.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=$titles&redirects=1&exlimit=4";
    }
}
