<?php namespace App\Services\Providers\Spotify;

use App\Models\Artist;
use App\Services\Artists\ExternalArtistBio;
use App\Traits\AuthorizesWithSpotify;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SpotifyArtist
{
    use AuthorizesWithSpotify;

    public function getContent(Artist $artist, array $options = []): ?array
    {
        if (!$artist->spotify_id) {
            return null;
        }

        $spotifyToken = $this->authorize();

        $responses = Http::pool(function (Pool $pool) use (
            $artist,
            $spotifyToken,
            $options,
        ) {
            $requests = [
                $pool
                    ->as('mainArtist')
                    ->withHeaders(['Authorization' => "Bearer $spotifyToken"])
                    ->get(
                        "https://api.spotify.com/v1/artists/$artist->spotify_id",
                    ),

                $pool
                    ->as('topTracks')
                    ->withHeaders(['Authorization' => "Bearer $spotifyToken"])
                    ->get(
                        "https://api.spotify.com/v1/artists/$artist->spotify_id/top-tracks?market=US",
                    ),
            ];

            if (Arr::get($options, 'importAlbums', true)) {
                $requests[] = $pool
                    ->as('partialAlbums')
                    ->withHeaders(['Authorization' => "Bearer $spotifyToken"])
                    ->get(
                        "https://api.spotify.com/v1/artists/$artist->spotify_id/albums?offset=0&limit=50&album_type=album,single",
                    );
            }

            if (Arr::get($options, 'importSimilarArtists', true)) {
                $requests[] = $pool
                    ->as('similarArtists')
                    ->withHeaders(['Authorization' => "Bearer $spotifyToken"])
                    ->get(
                        "https://api.spotify.com/v1/artists/$artist->spotify_id/related-artists",
                    );
            }

            $bioRequest = (new ExternalArtistBio())->fetch($artist, $pool);
            if ($bioRequest) {
                $requests[] = $bioRequest;
            }

            return $requests;
        });

        $data = [];

        if (isset($responses['mainArtist'])) {
            if ($responses['mainArtist']->successful()) {
                if ($responses['mainArtist']['name']) {
                    $data['mainInfo'] = (new SpotifyNormalizer())->artist(
                        $responses['mainArtist']->json(),
                        fullyScraped: true,
                    );
                    // make sure name is the same as we got passed in as sometimes spaces
                    // and other things might be in different places on our db and spotify
                    if ($artist->name) {
                        $data['mainInfo']['name'] = $artist->name;
                    }
                }
            } else {
                Log::error(
                    'Spotify API error: ' . $responses['mainArtist']->body(),
                );
            }
        }

        $data['genres'] = $responses['mainArtist']['genres'] ?? [];

        if (isset($responses['topTracks'])) {
            if ($responses['topTracks']->successful()) {
                $data['topTracks'] =
                    $responses['topTracks']->json()['tracks'] ?? [];
            } else {
                Log::error(
                    'Spotify API error: ' . $responses['topTracks']->body(),
                );
            }
        }

        if (
            isset($responses['similarArtists']) &&
            $responses['similarArtists']->successful()
        ) {
            $data['similar'] = collect(
                $responses['similarArtists']['artists'] ?? [],
            )
                ->map(fn($artist) => (new SpotifyNormalizer())->artist($artist))
                ->values();
        }

        if (isset($responses['partialAlbums'])) {
            if ($responses['partialAlbums']->successful()) {
                if (
                    isset($responses['partialAlbums']['items']) &&
                    !empty($responses['partialAlbums']['items'])
                ) {
                    // sometimes spotify API includes random albums, need to check artists array manually
                    $partialAlbums = array_filter(
                        $responses['partialAlbums']['items'],
                        fn($partialAlbum) => array_find(
                            $partialAlbum['artists'],
                            fn($partialAlbumArtist) => $artist->spotify_id ===
                                $partialAlbumArtist['id'],
                        ),
                    );

                    $data['albums'] = $this->getFullAlbums($partialAlbums);
                }
            } else {
                Log::error(
                    'Spotify API error: ' . $responses['partialAlbums']->body(),
                );
            }
        }

        if (isset($responses['bio'])) {
            if ($responses['bio']->successful()) {
                $description = (new ExternalArtistBio())->extractBioFromWikipediaResponse(
                    $responses['bio'],
                );
                if ($description) {
                    $data['bio']['description'] = $description;
                }
            } else {
                Log::error('Wikipedia API error: ' . $responses['bio']->body());
            }
        }

        return $data;
    }

    public function getFullAlbums(array $partialAlbums): Collection
    {
        $fullAlbums = collect([]);

        if (!count($partialAlbums)) {
            return $fullAlbums;
        }

        // limit to 40 albums per artist max
        // can only fetch 20 albums per spotify request
        $albumIdStrings = array_slice(
            $this->makeAlbumIdStrings($partialAlbums),
            0,
            2,
        );

        if (!count($albumIdStrings)) {
            return $fullAlbums;
        }

        // get full album objects from spotify
        $responses = Http::pool(function (Pool $pool) use ($albumIdStrings) {
            $token = $this->authorize();
            $requests = [];
            foreach ($albumIdStrings as $idsString) {
                $requests[] = $pool
                    ->withHeaders(['Authorization' => "Bearer $token"])
                    ->get("https://api.spotify.com/v1/albums?ids=$idsString");
            }
            return $requests;
        });

        foreach ($responses as $response) {
            if (!isset($response['albums'])) {
                if (!$response->successful()) {
                    Log::error('Spotify API error: ' . $response->body());
                }
                continue;
            }

            $fullAlbums = $fullAlbums->concat(
                array_map(
                    fn($a) => (new SpotifyNormalizer())->album($a),
                    $response['albums'],
                ),
            );
        }

        return $fullAlbums;
    }

    /**
     * Concat ids strings for all albums we want to fetch from spotify.
     */
    private function makeAlbumIdStrings(array $spotifyAlbums): array
    {
        $filtered = [];

        // filter out deluxe albums and same albums that were released in different markets
        foreach ($spotifyAlbums as $album) {
            $name = str_replace(' ', '', strtolower($album['name']));

            if (Str::contains($name, '(clean')) {
                continue;
            }

            if (
                isset($filtered[$name]) &&
                count($filtered[$name]['available_markets']) >=
                    count($album['available_markets'])
            ) {
                continue;
            }

            $filtered[$name] = $album;
        }

        // make multidimensional array of 20 spotify album ids as that is the max for albums query
        $chunked = array_chunk(array_map(fn($a) => $a['id'], $filtered), 20);

        $ids = array_map(fn($a) => implode(',', $a), $chunked);

        return $ids;
    }
}
