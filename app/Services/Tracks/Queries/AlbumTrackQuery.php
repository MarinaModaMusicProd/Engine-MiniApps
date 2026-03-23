<?php

namespace App\Services\Tracks\Queries;

use App\Models\Album;
use App\Services\Providers\MusicMetadataProvider;
use Illuminate\Database\Eloquent\Builder;

class AlbumTrackQuery extends BaseTrackQuery
{
    const ORDER_COL = 'number';
    const ORDER_DIR = 'asc';

    public function get(int $albumId): Builder
    {
        $album = Album::findOrFail($albumId);

        // fetch album tracks from external provider, if not fetched already
        if ($album->needsUpdating()) {
            (new MusicMetadataProvider())->importAlbum($album);
        }

        return $this->baseQuery()->where('tracks.album_id', $albumId);
    }
}
