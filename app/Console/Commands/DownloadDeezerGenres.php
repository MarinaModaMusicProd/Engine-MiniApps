<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\File;

class DownloadDeezerGenres extends Command
{
    protected $signature = 'deezer:download-genres {start=1} {end=208}';

    protected $description = 'Download existing Deezer genres into resources/deezer-genres.json';

    public function handle(): int
    {
        $start = max(1, (int) $this->argument('start'));
        $end = max($start, (int) $this->argument('end'));

        $genres = [];
        $progress = $this->output->createProgressBar($end - $start + 1);
        $progress->start();

        for ($id = $start; $id <= $end; $id++) {
            $response = Http::throw()
                ->timeout(8)
                ->get("https://api.deezer.com/genre/$id");

            if (!$response->ok()) {
                $progress->advance();
                continue;
            }

            $payload = $response->json();
            if (
                !is_array($payload) ||
                isset($payload['error']) ||
                !isset($payload['id'], $payload['name'])
            ) {
                $progress->advance();
                continue;
            }

            $genres[] = [
                'id' => (int) $payload['id'],
                'name' => slugify($payload['name']),
                'image' => $payload['picture'] ?? null,
            ];

            $progress->advance();
        }

        $progress->finish();
        $this->newLine(2);

        $filePath = resource_path('deezer-downloaded-genres.json');
        File::put(
            $filePath,
            json_encode($genres, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
        );

        $this->info('Saved ' . count($genres) . " genres to: $filePath");

        return self::SUCCESS;
    }
}
