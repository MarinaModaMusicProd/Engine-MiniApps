<?php

namespace App\Services\Providers\Deezer;

use App\Models\Artist;
use App\Models\Genre;
use App\Models\Track;
use App\Services\Providers\Contracts\MusicMetadataProviderContract;
use App\Services\Providers\DataObjects\FetchArtistOptions;
use App\Services\Providers\DataObjects\NormalizedAlbum;
use App\Services\Providers\DataObjects\NormalizedArtist;
use App\Services\Providers\DataObjects\NormalizedPlaylist;
use App\Services\Providers\DataObjects\NormalizedSearchResults;
use App\Services\Providers\DataObjects\NormalizedTrack;
use App\Services\Providers\Deezer\DeezerRadio;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class DeezerMetadataProvider implements MusicMetadataProviderContract
{
    public function getProviderIdName(): string
    {
        return 'deezer_id';
    }

    public function getArtist(
        string $providerId,
        FetchArtistOptions $options = new FetchArtistOptions(),
        Artist|null $artist = null,
    ): ?NormalizedArtist {
        return (new DeezerArtist())->get($providerId, $options, $artist);
    }

    public function getAlbum(string $deezerId): ?NormalizedAlbum
    {
        return (new DeezerAlbum())->get($deezerId);
    }

    public function getTrack(string $deezerId): ?NormalizedTrack
    {
        return (new DeezerTrack())->get($deezerId);
    }

    public function getGenre(string|null $providerId, string $genreName): ?array
    {
        return (new DeezerGenre())->get($providerId, $genreName);
    }

    public function search(
        string $query,
        int $page,
        ?int $perPage,
        array $modelTypes,
    ): NormalizedSearchResults {
        return (new DeezerSearch())->search(
            $query,
            $page,
            $perPage,
            $modelTypes,
        );
    }

    public function getPlaylist(string $playlistId): ?NormalizedPlaylist
    {
        return (new DeezerPlaylist())->get($playlistId);
    }

    public function getRecommendations(Model $model): Collection
    {
        if ($model instanceof Artist) {
            return (new DeezerRadio())->artist($model);
        }

        if ($model instanceof Track) {
            return (new DeezerRadio())->track($model);
        }

        if ($model instanceof Genre) {
            return $this->getGenre($model->deezer_id, $model->name)['tracks'] ??
                collect();
        }

        return collect();
    }
}
