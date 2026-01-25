<?php namespace App\Services\Artists;

use App\Models\Artist;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Str;
use GuzzleHttp\Promise\Promise;

class ExternalArtistBio
{
    public function fetch(Artist $artist, Pool $pool): Promise|null
    {
        $provider = settings('artist_bio_provider', 'wikipedia');

        if ($provider === 'wikipedia') {
            return $this->fetchFromWikipedia($artist, $pool);
        }

        return null;
    }

    protected function fetchFromWikipedia(Artist $artist, Pool $pool): Promise
    {
        $lang = settings('wikipedia_language', 'en');
        $url = $this->makeWikipediaApiUrl($artist->name, $lang);

        return $pool
            ->as('bio')
            ->withUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
            )
            ->get($url);
    }

    public function extractBioFromWikipediaResponse(
        Response $pages,
    ): string|null {
        if (!isset($pages['query']['pages'])) {
            return null;
        }

        $pages = $pages['query']['pages'];
        if (!is_array($pages) || empty($pages)) {
            return null;
        }

        foreach ($pages as $page) {
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

        foreach ($pages as $page) {
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
