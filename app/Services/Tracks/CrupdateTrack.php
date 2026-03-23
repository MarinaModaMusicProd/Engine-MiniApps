<?php

namespace App\Services\Tracks;

use App\Models\Album;
use App\Models\Genre;
use App\Models\Track;
use App\Notifications\ArtistUploadedMedia;
use App\Services\Providers\UpsertsDataIntoDB;
use Common\Files\Actions\SyncFileEntryModels;
use Common\Tags\Tag;
use Exception;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class CrupdateTrack
{
    use UpsertsDataIntoDB;

    public function __construct(
        protected Track $track,
        protected Tag $tag,
        protected Genre $genre,
    ) {}

    public function execute(
        array $data,
        Track|null $initialTrack = null,
        Album|array|null $album = null,
        bool $loadRelations = true,
    ): Track {
        $track = $initialTrack ?: $this->track->newInstance();
        $initialSrc = $initialTrack?->src;
        $initialImage = $initialTrack?->image;

        $inlineData = Arr::only($data, [
            'name',
            'image',
            'description',
            'duration',
            'number',
            'src',
            'album_id',
            'spotify_id',
        ]);

        $inlineData['number'] = Arr::get($data, 'number', 1);
        $inlineData['spotify_id'] =
            $inlineData['spotify_id'] ?? Arr::get($initialTrack, 'spotify_id');

        if (!$initialTrack) {
            $inlineData['owner_id'] = Auth::id();
        }

        if ($album) {
            $inlineData['album_id'] = $album['id'];
        }

        $track->fill($inlineData)->save();

        $newArtists = $this->getArtistIds($data, $album);
        $newArtists = $newArtists->map(function ($artistId) {
            if ($artistId === 'CURRENT_USER') {
                return Auth::user()->getOrCreateArtist()->id;
            } else {
                return $artistId;
            }
        });

        // make sure we're only attaching new artists to avoid too many db queries
        if ($track->relationLoaded('artists')) {
            $newArtists = $newArtists->filter(
                fn($newArtistId) => !$track
                    ->artists()
                    ->where('artists.id', $newArtistId)
                    ->first(),
            );
        }

        if ($newArtists->isNotEmpty()) {
            $pivots = $newArtists->map(function ($artistId, $index) use (
                $track,
            ) {
                return [
                    'artist_id' => $artistId,
                    'track_id' => $track['id'],
                    'primary' => $index === 0,
                ];
            });

            DB::table('artist_track')->where('track_id', $track->id)->delete();
            DB::table('artist_track')->insert($pivots->toArray());
        }

        $tags = Arr::get($data, 'tags', []);
        $tagIds = $this->tag->insertOrRetrieve($tags)->pluck('id');
        $track->tags()->sync($tagIds);

        $genres = Arr::get($data, 'genres', []);
        $genreIds = $this->genre->insertOrRetrieve($genres)->pluck('id');
        $track->genres()->sync($genreIds);

        if ($loadRelations) {
            $track->load('artists', 'tags', 'genres');
        }

        if (!$initialTrack && !$album) {
            $track->artists
                ->first()
                ->followers()
                ->chunkById(1000, function ($followers) use ($track) {
                    try {
                        Notification::send(
                            $followers,
                            new ArtistUploadedMedia($track),
                        );
                    } catch (Exception $e) {
                        //
                    }
                });
        }

        if ($waveData = Arr::get($data, 'waveData')) {
            $this->track
                ->getWaveStorageDisk()
                ->put("waves/{$track->id}.json", json_encode($waveData));
        }

        if ($lyrics = Arr::get($data, 'lyrics')) {
            $track->lyric()->create(['text' => $lyrics]);
        }

        $this->syncUploadedSrc(
            $track,
            initialSrc: $initialSrc,
            initialImage: $initialImage,
        );

        return $track;
    }

    protected function syncUploadedSrc(
        Track $track,
        string|null $initialSrc,
        string|null $initialImage,
    ) {
        if ($initialSrc !== $track->src) {
            // detach file entry if src was changed to a non-uploaded file
            if (
                !(new SyncFileEntryModels())->isUrlForUploadedFile($track->src)
            ) {
                $track->uploadedSrc()->detach();
            } else {
                (new SyncFileEntryModels())->fromUrl(
                    $track->src,
                    $track->uploadedSrc(),
                );
            }
        }

        if ($initialImage !== $track->image) {
            // detach file entry if image was changed to a non-uploaded file
            if (
                !(new SyncFileEntryModels())->isUrlForUploadedFile(
                    $track->image,
                )
            ) {
                $track->uploadedImage()->detach();
                return;
            }

            (new SyncFileEntryModels())->fromUrl(
                $track->image,
                $track->uploadedImage(),
            );
        }
    }

    private function getArtistIds(
        array|Collection $trackData,
        array|Album|null $album = null,
    ): array|Collection|null {
        $artists = collect([]);
        if ($trackArtists = Arr::get($trackData, 'artists')) {
            $artists = collect($trackArtists);
        } elseif (isset($album['artists'])) {
            $artists = collect($album['artists']);
        }

        if ($artists->isNotEmpty() && !is_scalar($artists->first())) {
            return $artists->map(fn($artist) => $artist['id']);
        }

        return $artists;
    }
}
