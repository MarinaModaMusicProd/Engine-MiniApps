<?php

namespace App\Services\Channels;

use App\Models\Album;
use App\Models\Track;
use App\Services\Providers\Deezer\DeezerNewAlbums;
use App\Services\Providers\Deezer\DeezerTopAlbums;
use App\Services\Providers\Deezer\DeezerTopArtists;
use App\Services\Providers\Deezer\DeezerTopTracks;
use App\Services\Providers\MusicMetadataProvider;
use App\Services\Providers\Spotify\SpotifyNewAlbums;
use App\Services\Providers\Spotify\SpotifyPlaylist;
use App\Services\Providers\Spotify\SpotifyTopAlbums;
use App\Services\Providers\Spotify\SpotifyTopArtists;
use App\Services\Providers\Spotify\SpotifyTopTracks;
use Illuminate\Support\Collection;

class FetchContentForChannelFromDeezer
{
    public function execute(string $method, mixed $value): Collection|null
    {
        Track::disableSearchSyncing();
        Album::disableSearchSyncing();

        return match ($method) {
            'topTracks' => (new DeezerTopTracks())->getContent(),
            'topAlbums' => (new DeezerTopAlbums())->getContent(),
            'topArtists' => (new DeezerTopArtists())->getContent(),
            'newAlbums' => (new DeezerNewAlbums())->getContent(),
            'playlistTracks' => collect(
                (new MusicMetadataProvider('deezer'))->importPlaylist(
                    $value,
                    createLocalPlaylist: false,
                )['tracks'] ?? [],
            ),
            default => null,
        };
    }
}
