<?php

namespace App\Services\Tracks;

use App\Models\Track;
use Common\Files\Actions\Deletion\DeleteEntries;
use Illuminate\Support\Facades\DB;

class DeleteTracks
{
    public function execute(array $trackIds): void
    {
        $tracks = Track::whereIn('id', $trackIds)->get();

        // delete waves
        $wavePaths = array_map(function ($id) {
            return "waves/{$id}.json";
        }, $trackIds);
        app(Track::class)->getWaveStorageDisk()->delete($wavePaths);

        $uploadFileEntryids = DB::table('file_entry_models')
            ->whereIn('model_id', $trackIds)
            ->where('model_type', Track::MODEL_TYPE)
            ->pluck('file_entry_id');

        app(DeleteEntries::class)->execute([
            'entryIds' => $uploadFileEntryids->toArray(),
        ]);

        // detach likeables
        DB::table('likes')
            ->whereIn('likeable_id', $trackIds)
            ->where('likeable_type', Track::MODEL_TYPE)
            ->delete();

        // detach genres
        DB::table('genreables')
            ->whereIn('genreable_id', $trackIds)
            ->where('genreable_type', Track::MODEL_TYPE)
            ->delete();

        // detach tags
        DB::table('taggables')
            ->whereIn('taggable_id', $trackIds)
            ->where('taggable_type', Track::MODEL_TYPE)
            ->delete();

        // detach reposts
        DB::table('reposts')
            ->whereIn('repostable_id', $trackIds)
            ->where('repostable_type', Track::MODEL_TYPE)
            ->delete();

        // detach from playlists
        DB::table('playlist_track')->whereIn('track_id', $trackIds)->delete();

        // detach from artists
        DB::table('artist_track')->whereIn('track_id', $trackIds)->delete();

        // delete plays
        DB::table('track_plays')->whereIn('track_id', $trackIds)->delete();

        // delete track
        app(Track::class)->destroy($tracks->pluck('id'));
    }
}
