<?php namespace App\Services\Providers\Deezer;

use App\Services\Providers\ContentProvider;
use App\Services\Providers\Deezer\DeezerBase;
use App\Services\Providers\Saving\StoreExternalDataInDb;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

class DeezerTopAlbums extends DeezerBase implements ContentProvider
{
    public function getContent(): Collection
    {
        @ini_set('max_execution_time', 0);

        $response =
            $this->getResponseData(
                Http::timeout(5)->get(
                    "{$this->baseUrl}/playlist/3155776842/tracks?limit=100",
                ),
            )['data'] ?? [];

        $normalizedAlbums = collect($response)->map(function ($track) {
            $album = [...$track['album'], 'artist' => $track['artist']];
            return $this->normalizer->album($album);
        });

        return (new StoreExternalDataInDb('deezer_id'))->execute(
            albums: $normalizedAlbums,
        )['albums'];
    }
}
