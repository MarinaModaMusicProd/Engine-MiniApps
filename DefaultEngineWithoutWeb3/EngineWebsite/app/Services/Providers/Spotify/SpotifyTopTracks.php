<?php namespace App\Services\Providers\Spotify;

use App;
use App\Models\Album;
use App\Models\Artist;
use App\Models\Track;
use App\Services\Providers\ContentProvider;
use App\Services\Providers\SaveOrUpdate;
use Illuminate\Support\Collection;

class SpotifyTopTracks implements ContentProvider
{
    use SaveOrUpdate;

    /**
     * @var SpotifyHttpClient
     */
    private $httpClient;

    public function __construct(protected SpotifyNormalizer $normalizer)
    {
        $this->httpClient = App::make(SpotifyHttpClient::class);

        @ini_set('max_execution_time', 0);
    }

    public function getContent(): Collection
    {
        $useTop50Playlist = false;
        if ($useTop50Playlist) {
            $response = $this->httpClient->get(
                'playlists/37i9dQZEVXbMDoHDwVN2tF',
            );
            $tracks = array_map(function ($track) {
                return $track['track'];
            }, $response['tracks']['items']);
            return $this->saveAndLoad($tracks);
        } else {
            $ids = (new SpotifyCharts())->getTrackIds();
            if (!$ids) {
                return collect();
            }
            $idString = collect($ids)->implode(',');
            $response = $this->httpClient->get("tracks?ids=$idString");
            return $this->saveAndLoad($response['tracks']);
        }
    }

    public function saveAndLoad(array $spotifyTracks): Collection
    {
        $normalizedTracks = collect($spotifyTracks)->map(function ($track) {
            return $this->normalizer->track($track);
        });
        $normalizedAlbums = $normalizedTracks->map(function ($normalizedTrack) {
            return $normalizedTrack['album'];
        });

        $savedArtists = $this->saveArtists(
            $normalizedTracks->merge($normalizedAlbums),
        );
        $savedAlbums = $this->saveAlbums($normalizedAlbums, $savedArtists);
        return $this->saveTracks(
            $normalizedTracks,
            $savedAlbums,
            $savedArtists,
        )->values();
    }

    /**
     * @param Collection $normalizedTracks
     * @return Artist[]|\Illuminate\Database\Eloquent\Collection
     */
    private function saveArtists($normalizedTracks)
    {
        $normalizedArtists = $normalizedTracks
            ->pluck('artists')
            ->flatten(1)
            ->unique('spotify_id');

        $this->saveOrUpdate($normalizedArtists, 'artists');
        return app(Artist::class)
            ->whereIn('spotify_id', $normalizedArtists->pluck('spotify_id'))
            ->get();
    }

    /**
     * @param Collection $normalizedAlbums
     * @param Collection $savedArtists
     * @return Album[]|\Illuminate\Database\Eloquent\Collection
     */
    private function saveAlbums($normalizedAlbums, $savedArtists)
    {
        $this->saveOrUpdate($normalizedAlbums, 'albums');

        $savedAlbums = app(Album::class)
            ->whereIn('spotify_id', $normalizedAlbums->pluck('spotify_id'))
            ->get();

        // attach artists to albums
        $pivots = $normalizedAlbums
            ->map(function ($normalizedAlbum) use (
                $savedArtists,
                $savedAlbums,
            ) {
                return $normalizedAlbum['artists']->map(function ($artist) use (
                    $savedArtists,
                    $savedAlbums,
                    $normalizedAlbum,
                ) {
                    $artist = $savedArtists->first(function ($a) use ($artist) {
                        return $a['spotify_id'] === $artist['spotify_id'];
                    });
                    return [
                        'artist_id' => $artist['id'],
                        'album_id' => $savedAlbums
                            ->where(
                                'spotify_id',
                                $normalizedAlbum['spotify_id'],
                            )
                            ->first()->id,
                    ];
                });
            })
            ->flatten(1);

        $this->saveOrUpdate($pivots, 'artist_album');

        $savedAlbums->load('artists');

        return $savedAlbums;
    }

    private function saveTracks(
        Collection $normalizedTracks,
        Collection $savedAlbums,
        Collection $artists,
    ): Collection {
        $originalOrder = [];

        $tracksForInsert = $normalizedTracks
            ->map(function ($track, $k) use ($savedAlbums, &$originalOrder) {
                // spotify sometimes has multiple albums with same name for same artist
                $album = $savedAlbums
                    ->where('spotify_id', $track['album']['spotify_id'])
                    ->first();
                if (!$album) {
                    return null;
                }

                $track['album_id'] = $album->id;
                $originalOrder[$track['name']] = $k;
                return $track;
            })
            ->filter();

        $this->saveOrUpdate($tracksForInsert, 'tracks');

        $loadedTracks = app(Track::class)
            ->whereIn('spotify_id', $tracksForInsert->pluck('spotify_id'))
            ->get();

        // attach artists to tracks
        $pivots = $tracksForInsert
            ->map(function ($trackForInsert) use (
                $normalizedTracks,
                $loadedTracks,
                $artists,
            ) {
                $tempArtists = $normalizedTracks
                    ->where('spotify_id', $trackForInsert['spotify_id'])
                    ->first()['artists'];
                return $tempArtists->map(function ($artist) use (
                    $artists,
                    $trackForInsert,
                    $loadedTracks,
                ) {
                    $artist = $artists->first(function ($a) use ($artist) {
                        return $a['spotify_id'] === $artist['spotify_id'];
                    });
                    return [
                        'artist_id' => $artist['id'],
                        'track_id' => $loadedTracks
                            ->where('spotify_id', $trackForInsert['spotify_id'])
                            ->first()->id,
                    ];
                });
            })
            ->flatten(1);

        $this->saveOrUpdate($pivots, 'artist_track');

        $loadedTracks->load(['artists', 'album.artists']);

        return $loadedTracks->sort(function ($a, $b) use ($originalOrder) {
            $originalAIndex = isset($originalOrder[$a->name])
                ? $originalOrder[$a->name]
                : 0;
            $originalBIndex = isset($originalOrder[$b->name])
                ? $originalOrder[$b->name]
                : 0;

            if ($originalAIndex == $originalBIndex) {
                return 0;
            }
            return $originalAIndex < $originalBIndex ? -1 : 1;
        });
    }
}
