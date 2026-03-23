<?php namespace App\Services\Providers\Spotify;

use App\Services\Providers\ContentProvider;
use App\Services\Providers\MusicMetadataProvider;
use App\Services\Providers\Saving\StoreExternalDataInDb;
use App\Traits\AuthorizesWithSpotify;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

class SpotifyTopTracks extends SpotifyBase implements ContentProvider
{
    use AuthorizesWithSpotify;

    public function getContent(): Collection
    {
        @ini_set('max_execution_time', 0);

        $useTop50Playlist = false;
        if ($useTop50Playlist) {
            return (new MusicMetadataProvider('spotify'))->importPlaylist(
                '37i9dQZEVXbMDoHDwVN2tF',
                createLocalPlaylist: false,
            )['tracks'] ?? collect();
        } else {
            $topTracks = (new SpotifyCharts())->getTopTracks();
            if (empty($topTracks)) {
                return collect();
            }

            $originalOrder = collect($topTracks)->keyBy('name');

            $normalizedTracks = config('services.spotify.use_deprecated_api')
                ? $this->enrichTracks($topTracks)
                : collect($topTracks);

            $savedData = (new StoreExternalDataInDb('spotify_id'))->execute(
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

    protected function enrichTracks(array $tracks): array
    {
        $idString = collect($tracks)->pluck('externalId')->implode(',');
        $response = Http::timeout(8)
            ->withHeaders([
                'Authorization' => 'Bearer ' . $this->authorize(),
            ])
            ->get("{$this->baseUrl}/tracks?ids=$idString");

        return array_map(
            fn($track) => $this->normalizer->track($track),
            $this->getResponseData($response)['tracks'] ?? [],
        );
    }
}
