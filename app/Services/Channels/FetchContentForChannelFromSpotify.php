<?php

namespace App\Services\Channels;

use App\Models\Album;
use App\Models\Track;
use App\Services\Providers\MusicMetadataProvider;
use App\Services\Providers\Spotify\SpotifyNewAlbums;
use App\Services\Providers\Spotify\SpotifyPlaylist;
use App\Services\Providers\Spotify\SpotifyTopAlbums;
use App\Services\Providers\Spotify\SpotifyTopArtists;
use App\Services\Providers\Spotify\SpotifyTopTracks;
use Illuminate\Support\Collection;

class FetchContentForChannelFromSpotify
{
    public function execute(string $method, mixed $value): Collection|null
    {
        Track::disableSearchSyncing();
        Album::disableSearchSyncing();

        $method = lcfirst(preg_replace('/^spotify/', '', $method));

        return match ($method) {
            'topTracks' => (new SpotifyTopTracks())->getContent(),
            'topAlbums' => (new SpotifyTopAlbums())->getContent(),
            'topArtists' => (new SpotifyTopArtists())->getContent(),
            'newAlbums' => (new SpotifyNewAlbums())->getContent(),
            'playlistTracks' => collect(
                (new MusicMetadataProvider('spotify'))->importPlaylist(
                    $value,
                    createLocalPlaylist: false,
                )['tracks'] ?? [],
            ),
            default => null,
        };
    }
}
