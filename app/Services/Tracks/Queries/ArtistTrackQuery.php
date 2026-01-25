<?php

namespace App\Services\Tracks\Queries;

use App\Models\Artist;
use App\Services\Artists\SyncArtistWithSpotify;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;

class ArtistTrackQuery extends BaseTrackQuery
{
    const ORDER_COL = 'popularity';

    public function get(int $artistId): Builder
    {
        $artist = Artist::find($artistId);

        if ($artist && $artist->needsUpdating()) {
            (new SyncArtistWithSpotify())->execute($artist);
        }

        return $this->baseQuery()
            ->join('artist_track', 'tracks.id', '=', 'artist_track.track_id')
            ->where('artist_track.artist_id', $artistId)
            ->select('tracks.*');
    }
}
