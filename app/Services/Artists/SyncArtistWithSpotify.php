<?php

namespace App\Services\Artists;

use App\Models\Artist;
use App\Services\Providers\Spotify\SpotifyArtist;

class SyncArtistWithSpotify
{
    public function execute(Artist $artist, ?array $options = []): Artist
    {
        $data = app(SpotifyArtist::class)->getContent($artist, $options);

        if ($data) {
            $artist = (new SpotifyArtistSaver())->save($artist, $data);
            unset($artist['albums']);
        }

        return $artist;
    }
}
