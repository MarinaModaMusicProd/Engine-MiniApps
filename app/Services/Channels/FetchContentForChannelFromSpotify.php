<?php

namespace App\Services\Channels;

use App\Models\Album;
use App\Models\Track;
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
            'topTracks' => app(SpotifyTopTracks::class)->getContent(),
            'topAlbums' => app(SpotifyTopAlbums::class)->execute(),
            'topArtists' => app(SpotifyTopArtists::class)->execute(),
            'newAlbums' => app(SpotifyNewAlbums::class)->getContent(),
            'playlistTracks' => app(SpotifyPlaylist::class)->getContent($value)[
                'tracks'
            ] ?? null,
            default => null,
        };
    }
}
