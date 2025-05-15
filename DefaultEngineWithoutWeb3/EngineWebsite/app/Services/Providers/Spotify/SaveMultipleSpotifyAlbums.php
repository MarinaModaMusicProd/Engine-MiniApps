<?php

namespace App\Services\Providers\Spotify;

use App\Models\Album;
use App\Models\Artist;
use App\Services\Providers\SaveOrUpdate;
use Illuminate\Support\Collection;

class SaveMultipleSpotifyAlbums
{
    use SaveOrUpdate;

    public function execute(
        Collection $spotifyAlbums,
        string $orderBy,
    ): Collection {
        $this->saveOrUpdate($spotifyAlbums, 'albums');

        $savedAlbums = Album::whereIn(
            'spotify_id',
            $spotifyAlbums->pluck('spotify_id'),
        )
            ->orderBy($orderBy, 'desc')
            ->get()
            ->keyBy('spotify_id');

        // attach artists to albums
        $spotifyArtists = $spotifyAlbums
            ->pluck('artists')
            ->flatten(1)
            ->unique('spotify_id');
        $this->saveOrUpdate($spotifyArtists, 'artists');
        $savedArtists = Artist::whereIn(
            'spotify_id',
            $spotifyArtists->pluck('spotify_id'),
        )
            ->get(['spotify_id', 'id', 'name'])
            ->keyBy('spotify_id');

        $pivots = $spotifyAlbums
            ->map(function ($normalizedAlbum) use (
                $savedArtists,
                $savedAlbums,
            ) {
                return $normalizedAlbum['artists']->map(function (
                    $normalizedArtist,
                ) use ($normalizedAlbum, $savedArtists, $savedAlbums) {
                    $savedAlbum = $savedAlbums[$normalizedAlbum['spotify_id']];
                    $savedArtist =
                        $savedArtists[$normalizedArtist['spotify_id']];
                    if (!$savedAlbum) {
                        $savedAlbum = $savedAlbums->first(function (
                            Album $album,
                        ) use ($normalizedAlbum) {
                            return $album->name === $normalizedAlbum['name'];
                        });
                    }
                    if (!$savedArtist) {
                        $savedArtist = $savedArtists->first(function (
                            Artist $artist,
                        ) use ($normalizedArtist) {
                            return $artist->name === $normalizedArtist['name'];
                        });
                    }
                    return [
                        'album_id' => $savedAlbum->id,
                        'artist_id' => $savedArtist->id,
                    ];
                });
            })
            ->flatten(1);
        $this->saveOrUpdate($pivots, 'artist_album');

        (new SpotifyTrackSaver())->save($spotifyAlbums, $savedAlbums);

        return $savedAlbums
            ->load('artists', 'tracks')
            ->sortByDesc('artist.spotify_popularity')
            ->values();
    }
}
