<?php namespace App\Services\Providers\Deezer;

use App\Models\Artist;
use App\Models\Track;
use App\Services\Providers\Deezer\DeezerBase;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

class DeezerRadio extends DeezerBase
{
    public function artist(Artist $artist): Collection
    {
        $response = $this->getResponseData(
            Http::timeout(5)->get(
                "{$this->baseUrl}/artist/{$artist->deezer_id}/radio",
            ),
        );

        return collect($response['data'] ?? [])->map(
            fn($track) => $this->normalizer->track($track),
        );
    }

    public function track(Track $track): Collection
    {
        $artist = $track->artists()->select('*')->first();
        if (!$artist) {
            return collect();
        }

        // Simulate track radio by using track artist. Deezer doesn't have a track radio endpoint currently.
        return $this->artist($artist);
    }
}
