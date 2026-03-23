<?php

namespace App\Services\Providers;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Genre;
use App\Models\Playlist;
use App\Models\Track;
use App\Services\Artists\CrupdateArtist;
use App\Services\Providers\Contracts\MusicMetadataProviderContract;
use App\Services\Providers\DataObjects\FetchArtistOptions;
use App\Services\Providers\Deezer\DeezerMetadataProvider;
use App\Services\Providers\Saving\StoreExternalDataInDb;
use App\Services\Providers\Spotify\SpotifyMetadataProvider;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class MusicMetadataProvider
{
    protected MusicMetadataProviderContract|null $provider;

    public function __construct(string|null $providerName = null)
    {
        if (!$providerName) {
            $providerName = settings('metadata_provider', 'spotify');
        }

        $this->provider = match ($providerName) {
            'spotify' => new SpotifyMetadataProvider(),
            'deezer' => new DeezerMetadataProvider(),
            default => null,
        };
    }

    public function getProvider(): MusicMetadataProviderContract|null
    {
        return $this->provider;
    }

    public function canUpdateArtist(Artist $artist): bool
    {
        return $this->canUpdateModel($artist);
    }

    public function importArtist(
        Artist|string $artistOrId,
        FetchArtistOptions $options = new FetchArtistOptions(),
    ): Artist|null {
        if (!$this->provider) {
            return null;
        }

        $providerId =
            $artistOrId instanceof Artist
                ? $artistOrId->{$this->provider->getProviderIdName()}
                : $artistOrId;

        if (!$providerId) {
            return null;
        }

        $normalizedArtist = $this->provider->getArtist(
            $providerId,
            $options,
            artist: $artistOrId instanceof Artist ? $artistOrId : null,
        );

        if (!$normalizedArtist) {
            return null;
        }

        // Keep DB naming stable in case external provider spacing differs.
        if ($artistOrId instanceof Artist) {
            $normalizedArtist->name = $artistOrId->name;
        }

        $savedItems = (new StoreExternalDataInDb(
            $this->provider->getProviderIdName(),
        ))->execute(artists: [$normalizedArtist]);
        if (!isset($savedItems['artists'][0])) {
            return null;
        }

        $updatedArtist = $savedItems['artists'][0];

        if ($normalizedArtist->bioText) {
            $updatedArtist
                ->profile()
                ->updateOrCreate(
                    ['artist_id' => $updatedArtist->id],
                    ['description' => $normalizedArtist->bioText],
                );
        }

        if (!empty($normalizedArtist->bioImages)) {
            (new CrupdateArtist())->syncProfileImages(
                $updatedArtist,
                $normalizedArtist->bioImages,
            );
        }

        return $updatedArtist;
    }

    public function canUpdateAlbum(Album $album): bool
    {
        return $this->canUpdateModel($album);
    }

    public function importAlbum(Album|string $albumOrId): Album|null
    {
        if ($this->provider) {
            $providerId =
                $albumOrId instanceof Album
                    ? $albumOrId->{$this->provider->getProviderIdName()}
                    : $albumOrId;

            if ($providerId) {
                $normalizedAlbum = $this->provider->getAlbum($providerId);
                if ($normalizedAlbum) {
                    $savedItems = (new StoreExternalDataInDb(
                        $this->provider->getProviderIdName(),
                    ))->execute(albums: [$normalizedAlbum]);
                    if (isset($savedItems['albums'][0])) {
                        return $savedItems['albums'][0];
                    }
                }
            }
        }

        return null;
    }

    public function importTrack(Track|string $trackOrId): Track|null
    {
        if ($this->provider) {
            $providerId =
                $trackOrId instanceof Track
                    ? $trackOrId->{$this->provider->getProviderIdName()}
                    : $trackOrId;

            if ($providerId) {
                $normalizedTrack = $this->provider?->getTrack($providerId);

                if ($normalizedTrack) {
                    $savedItems = (new StoreExternalDataInDb(
                        $this->provider->getProviderIdName(),
                    ))->execute(tracks: [$normalizedTrack]);
                    if (isset($savedItems['tracks'][0])) {
                        return $savedItems['tracks'][0];
                    }
                }
            }
        }

        return null;
    }

    public function canUpdateGenre(Genre $genre): bool
    {
        return $this->canUpdateModel($genre);
    }

    public function importGenre(
        Genre|string|null $genreOrId,
        string $genreName,
    ): array|null {
        $response = [];

        if ($this->provider) {
            $providerId =
                $genreOrId instanceof Genre
                    ? $genreOrId->{$this->provider->getProviderIdName()}
                    : $genreOrId;

            $normalizedData = $this->provider->getGenre(
                $providerId,
                $genreName,
            );
            if ($normalizedData) {
                $savedData = (new StoreExternalDataInDb(
                    $this->provider->getProviderIdName(),
                ))->execute(
                    albums: $normalizedData['albums'] ?? [],
                    tracks: $normalizedData['tracks'] ?? [],
                    artists: $normalizedData['artists'] ?? [],
                );

                $response['data'] = $savedData;
                if ($genreOrId instanceof Genre) {
                    $response['genre'] = $genreOrId;
                }

                return $response;
            }
        }

        return null;
    }

    public function search(
        string $query,
        int $page,
        ?int $perPage,
        array $modelTypes,
    ): array|null {
        if ($this->provider) {
            $normalizedResults = $this->provider->search(
                $query,
                $page,
                $perPage,
                $modelTypes,
            );

            if ($normalizedResults) {
                $storedResults = (new StoreExternalDataInDb(
                    $this->provider->getProviderIdName(),
                ))->execute(
                    artists: $normalizedResults->artists['data'] ?? null,
                    albums: $normalizedResults->albums['data'] ?? null,
                    tracks: $normalizedResults->tracks['data'] ?? null,
                );

                return $normalizedResults->toLocalPagination(
                    $storedResults,
                    $page,
                    $perPage,
                );
            }
        }

        return null;
    }

    public function importPlaylist(
        string $providerId,
        bool $createLocalPlaylist = false,
    ): array {
        $response = [];

        if ($this->provider) {
            $normalizedPlaylist = $this->provider?->getPlaylist($providerId);

            if ($normalizedPlaylist) {
                $savedData = (new StoreExternalDataInDb(
                    $this->provider->getProviderIdName(),
                ))->execute(
                    tracks: $normalizedPlaylist->tracks,
                    albums: collect($normalizedPlaylist->tracks)
                        ->pluck('album')
                        ->filter(),
                );
                $response['tracks'] = $savedData['tracks'];
                $response['albums'] = $savedData['albums'];

                if ($createLocalPlaylist) {
                    // external id is unique in the table, so no need to scope by owner
                    $storedPlaylist = Playlist::query()->updateOrCreate(
                        [
                            $normalizedPlaylist->externalIdName => $providerId,
                        ],
                        [
                            'name' => $normalizedPlaylist->name,
                            'description' => $normalizedPlaylist->description,
                            'image' => $normalizedPlaylist->image,
                            'owner_id' => Auth::id(),
                        ],
                    );

                    $storedPlaylist
                        ->editors()
                        ->syncWithoutDetaching([Auth::id()]);

                    $storedPlaylist->tracks()->syncWithoutDetaching(
                        Arr::mapWithKeys(
                            $savedData['tracks']->toArray(),
                            fn($track, $index) => [
                                $track['id'] => ['position' => $index + 1],
                            ],
                        ),
                    );

                    $response['playlist'] = $storedPlaylist;
                }
            }
        }

        return $response;
    }

    public function getRecommendations(Model $model): Collection
    {
        $normalizedTracks =
            $this->provider?->getRecommendations($model) ?? collect();

        if (!$normalizedTracks->isEmpty()) {
            $savedData = (new StoreExternalDataInDb(
                $this->provider->getProviderIdName(),
            ))->execute(tracks: $normalizedTracks);
            return $savedData['tracks'];
        }

        return collect();
    }

    protected function canUpdateModel(Artist|Album|Genre $model): bool
    {
        $providerIdName = $this->provider?->getProviderIdName();

        return $providerIdName
            ? (bool) ($model->{$providerIdName} ?? null)
            : false;
    }
}
