<?php namespace App\Services\Providers\Deezer;

use App\Services\Providers\ContentProvider;
use App\Services\Providers\Deezer\DeezerBase;
use App\Services\Providers\Saving\StoreExternalDataInDb;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

class DeezerTopTracks extends DeezerBase implements ContentProvider
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

        $normalizedTracks = collect($response)->map(
            fn($track) => $this->normalizer->track($track),
        );

        $originalOrder = $normalizedTracks->keyBy('name');

        $savedData = (new StoreExternalDataInDb('deezer_id'))->execute(
            tracks: $normalizedTracks,
        );

        return collect($savedData['tracks'])
            ->sort(function ($a, $b) use ($originalOrder) {
                $originalAIndex = isset($originalOrder[$a->name])
                    ? $originalOrder[$a->name]
                    : 0;
                $originalBIndex = isset($originalOrder[$b->name])
                    ? $originalOrder[$b->name]
                    : 0;

                if ($originalAIndex == $originalBIndex) {
                    return 0;
                }
                return $originalAIndex < $originalBIndex ? -1 : 1;
            })
            ->values();
    }
}
