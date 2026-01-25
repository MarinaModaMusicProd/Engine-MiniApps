<?php namespace App\Services\Artists;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Genre;
use App\Services\Providers\Spotify\SpotifyTopTracks;
use App\Services\Providers\UpsertsDataIntoDB;
use App\Services\Providers\Spotify\SpotifyTrackSaver;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class SpotifyArtistSaver
{
    use UpsertsDataIntoDB;

    public function save(Artist $artist, array $data): Artist
    {
        $data['mainInfo']['updated_at'] = Carbon::now();
        $artist->fill($data['mainInfo'])->save();

        if (isset($data['albums'])) {
            $this->upsert($data['albums'], 'albums');
            $albums = Album::whereIn(
                'spotify_id',
                $data['albums']->pluck('spotify_id'),
            )->get();
            $artist->albums()->syncWithoutDetaching($albums->pluck('id'));
            $artist->setRelation('albums', $albums);
            (new SpotifyTrackSaver())->save($data['albums'], $albums);
        }

        if (isset($data['topTracks'])) {
            $tracks = (new SpotifyTopTracks())->saveAndLoad($data['topTracks']);
        }

        if (isset($data['similar'])) {
            $this->saveSimilar($data['similar'], $artist);
        }

        if (!empty($data['genres'])) {
            $this->saveGenres($data['genres'], $artist);
        }

        if (isset($data['bio']['description'])) {
            $artist
                ->profile()
                ->updateOrCreate(
                    ['artist_id' => $artist->id],
                    ['description' => $data['bio']['description']],
                );
        }

        if (isset($bio['images']) && count($bio['images'])) {
            (new CrupdateArtist())->syncProfileImages($artist, $bio['images']);
        }

        return $artist;
    }

    public function saveGenres(array $genres, Artist $artist): void
    {
        if (!empty($genres)) {
            $dbGenres = app(Genre::class)->insertOrRetrieve($genres);
            $artist->genres()->sync($dbGenres->pluck('id'));
        }
    }

    public function saveSimilar(Collection $similar, Artist $artist): void
    {
        $spotifyIds = $similar->pluck('spotify_id');

        // insert similar artists that don't exist in db yet
        $this->upsert($similar, 'artists');

        // get ids in database for artist we just inserted
        $dbIds = Artist::whereIn('spotify_id', $spotifyIds)->pluck(
            'id',
            'spotify_id',
        );

        // order ids in the original spotify order
        $dbIds = $dbIds
            ->sortBy(fn($dbId, $spotifyId) => $spotifyIds->search($spotifyId))
            ->values();

        $artist->similar()->sync($dbIds);
    }
}
