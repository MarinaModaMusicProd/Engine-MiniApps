<?php

namespace App\Services\Providers\Spotify;

use App\Models\Artist;
use App\Services\Providers\UpsertsDataIntoDB;
use Illuminate\Support\Collection;

class SpotifyTopArtists
{
    use UpsertsDataIntoDB;

    public function execute(): Collection
    {
        $ids = (new SpotifyCharts())->getArtistIds();

        if (!is_null($ids)) {
            $idString = collect($ids)->implode(',');
            $spotifyArtists =
                app(SpotifyHttpClient::class)->get("artists?ids=$idString")[
                    'artists'
                ] ?? [];

            $spotifyArtists = collect($spotifyArtists)->map(
                fn($artist) => (new SpotifyNormalizer())->artist($artist),
            );

            $this->upsert($spotifyArtists, 'artists', true);

            return Artist::whereIn('spotify_id', $ids)
                ->orderBy('spotify_popularity', 'desc')
                ->get();
        }

        return collect();
    }
}
