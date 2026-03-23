<?php

namespace App\Services\Providers\Spotify;

use App\Models\Artist;
use App\Services\Providers\Contracts\MusicMetadataProviderContract;
use App\Services\Providers\DataObjects\FetchArtistOptions;
use App\Services\Providers\DataObjects\NormalizedAlbum;
use App\Services\Providers\DataObjects\NormalizedArtist;
use App\Services\Providers\DataObjects\NormalizedPlaylist;
use App\Services\Providers\DataObjects\NormalizedSearchResults;
use App\Services\Providers\DataObjects\NormalizedTrack;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class SpotifyMetadataProvider implements MusicMetadataProviderContract
{
    public function getProviderIdName(): string
    {
        return 'spotify_id';
    }

    public function getArtist(
        string $providerId,
        FetchArtistOptions $options = new FetchArtistOptions(),
        Artist|null $artist = null,
    ): ?NormalizedArtist {
        return (new SpotifyArtist())->get($providerId, $options, $artist);
    }

    public function getAlbum(string $spotifyId): ?NormalizedAlbum
    {
        return (new SpotifyAlbum())->get($spotifyId);
    }

    public function getTrack(string $providerId): ?NormalizedTrack
    {
        return (new SpotifyTrack())->get($providerId);
    }

    public function getGenre(string|null $genreId, string $genreName): ?array
    {
        return (new SpotifyGenre())->get($genreName);
    }

    public function search(
        string $query,
        int $page,
        ?int $perPage,
        array $modelTypes,
    ): NormalizedSearchResults {
        return (new SpotifySearch())->search(
            $query,
            $page,
            $perPage,
            $modelTypes,
        );
    }

    public function getPlaylist(string $playlistId): ?NormalizedPlaylist
    {
        return (new SpotifyPlaylist())->getContent($playlistId);
    }

    public function getRecommendations(Model $model): Collection
    {
        return (new SpotifyRadio())->getRecommendations($model);
    }
}
