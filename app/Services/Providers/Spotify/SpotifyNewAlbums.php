<?php namespace App\Services\Providers\Spotify;

use App\Services\Providers\ContentProvider;
use App\Services\Providers\UpsertsDataIntoDB;
use Illuminate\Support\Collection;

class SpotifyNewAlbums implements ContentProvider
{
    use UpsertsDataIntoDB;

    public function getContent(): Collection
    {
        @ini_set('max_execution_time', 0);

        $response = app(SpotifyHttpClient::class)->get(
            'browse/new-releases?country=US&limit=40',
        );
        $spotifyAlbums = app(SpotifyArtist::class)->getFullAlbums(
            $response['albums']['items'],
        );

        return (new SaveMultipleSpotifyAlbums())->execute(
            $spotifyAlbums,
            orderBy: 'release_date',
        );
    }
}
