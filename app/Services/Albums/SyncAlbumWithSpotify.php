<?php

namespace App\Services\Albums;

use App\Models\Album;
use App\Models\Artist;
use App\Services\Providers\UpsertsDataIntoDB;
use App\Services\Providers\Spotify\SpotifyAlbum;
use App\Services\Providers\Spotify\SpotifyTrackSaver;
use Illuminate\Support\Arr;

class SyncAlbumWithSpotify
{
    use UpsertsDataIntoDB;

    public function execute(Album $album): Album
    {
        $spotifyAlbum = (new SpotifyAlbum())->getContent($album);
        if (!$spotifyAlbum) {
            return $album;
        }

        // if album artists are not in database yet, fetch and save them
        $notSavedArtists = $spotifyAlbum['artists']->filter(function (
            $spotifyArtist,
        ) use ($album) {
            return !$album->artists
                ->where('spotify_id', $spotifyArtist['spotify_id'])
                ->first();
        });
        if (!empty($notSavedArtists)) {
            $this->upsert($notSavedArtists, 'artists');
            $artistIds = Artist::whereIn(
                'spotify_id',
                $notSavedArtists->pluck('spotify_id'),
            )->pluck('id');
            $album->artists()->syncWithoutDetaching($artistIds);
        }

        $album->fill(Arr::except($spotifyAlbum, ['tracks', 'artists']))->save();

        (new SpotifyTrackSaver())->save(
            collect([$spotifyAlbum]),
            collect([$album]),
        );

        return $album;
    }
}
