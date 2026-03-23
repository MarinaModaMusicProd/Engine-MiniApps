<?php

namespace App\Services\Providers\Contracts;

use App\Models\Artist;
use App\Services\Providers\DataObjects\FetchArtistOptions;
use App\Services\Providers\DataObjects\NormalizedAlbum;
use App\Services\Providers\DataObjects\NormalizedArtist;
use App\Services\Providers\DataObjects\NormalizedPlaylist;
use App\Services\Providers\DataObjects\NormalizedSearchResults;
use App\Services\Providers\DataObjects\NormalizedTrack;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

interface MusicMetadataProviderContract
{
    public function getProviderIdName(): string;

    public function getArtist(
        string $providerId,
        FetchArtistOptions $options,
        Artist|null $artist = null,
    ): ?NormalizedArtist;

    public function getTrack(string $providerId): ?NormalizedTrack;

    public function getAlbum(string $providerId): ?NormalizedAlbum;

    public function search(
        string $query,
        int $page,
        ?int $perPage,
        array $modelTypes,
    ): NormalizedSearchResults;

    public function getGenre(
        string|null $providerId,
        string $genreName,
    ): ?array;

    public function getPlaylist(string $playlistId): ?NormalizedPlaylist;

    public function getRecommendations(Model $model): Collection;
}
