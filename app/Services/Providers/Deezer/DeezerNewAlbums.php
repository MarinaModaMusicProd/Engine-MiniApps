<?php namespace App\Services\Providers\Deezer;

use App\Services\Providers\ContentProvider;
use App\Services\Providers\Deezer\DeezerBase;
use App\Services\Providers\Saving\StoreExternalDataInDb;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

class DeezerNewAlbums extends DeezerBase implements ContentProvider
{
    public function getContent(): Collection
    {
        @ini_set('max_execution_time', 0);

        $response =
            $this->getResponseData(
                Http::timeout(5)->get(
                    "{$this->baseUrl}/editorial/0/releases?limit=40&country=US",
                ),
            )['data'] ?? [];

        $normalizedAlbums = collect($response)->map(
            fn($album) => $this->normalizer->album($album),
        );

        $savedData = (new StoreExternalDataInDb('deezer_id'))->execute(
            albums: $normalizedAlbums,
        );

        return $savedData['albums']->sortBy('release_date');
    }
}
