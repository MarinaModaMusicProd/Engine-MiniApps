<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;

class DownloadLastfmGenres extends Command
{
    protected $genresToExclude = [
        'seen-live',
        'female-vocalists',
        'ambient',
        'experimental',
        'instrumental',
        'singer-songwriter',
        'industrial',
        'japanese',
        'british',
        'bookmark',
        'acoustic',
        'german',
    ];

    protected $signature = 'lastfm:download-genres {limit=100}';

    public function handle(): int
    {
        $apiKey = config('services.lastfm.key');
        if (!$apiKey) {
            $this->error(
                'Missing Last.fm API key in config: services.lastfm.key',
            );
            return self::FAILURE;
        }

        $limit = max(1, (int) $this->argument('limit'));

        $response = Http::throw()
            ->timeout(12)
            ->get('https://ws.audioscrobbler.com/2.0/', [
                'method' => 'tag.getTopTags',
                'api_key' => $apiKey,
                'format' => 'json',
                'limit' => $limit,
            ]);

        $payload = $response->json();
        if (!is_array($payload) || !isset($payload['toptags']['tag'])) {
            $this->error('Unexpected Last.fm response payload.');
            return self::FAILURE;
        }

        $tags = collect($payload['toptags']['tag']);
        $genres = $tags
            ->filter(
                fn($tag) => is_array($tag) &&
                    !empty($tag['name']) &&
                    !in_array(slugify($tag['name']), $this->genresToExclude),
            )
            ->values()
            ->map(function (array $tag, int $index) use ($tags) {
                $count = isset($tag['count']) ? (int) $tag['count'] : 0;
                $total = max(1, $tags->count());

                return [
                    'name' => slugify($tag['name']),
                    'display_name' => ucfirst($tag['name']),
                    'popularity' => $count > 0 ? $count : $total - $index,
                    'image' => $this->getImage($tag['name']),
                ];
            })
            ->all();

        $filePath = resource_path('lastfm-downloaded-genres.json');
        File::put(
            $filePath,
            json_encode($genres, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
        );

        $this->info('Saved ' . count($genres) . " genres to: $filePath");

        return self::SUCCESS;
    }

    protected function getImage(string $name): ?string
    {
        $path = "images/genres/$name.jpg";
        return File::exists(public_path($path)) ? $path : null;
    }
}
