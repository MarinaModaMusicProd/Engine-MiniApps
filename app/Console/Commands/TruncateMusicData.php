<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Console\ConfirmableTrait;
use Illuminate\Support\Facades\DB;

class TruncateMusicData extends Command
{
    use ConfirmableTrait;

    protected $signature = 'music:truncate {--force : Force the operation to run when in production.}';

    protected $description = 'Truncate artists, albums, tracks and their related music tables.';

    public function handle(): int
    {
        if (!$this->confirmToProceed()) {
            return self::SUCCESS;
        }

        // artists
        DB::table('artists')->truncate();
        DB::table('artist_album')->truncate();
        DB::table('artist_bios')->truncate();
        DB::table('artist_track')->truncate();
        DB::table('similar_artists')->truncate();
        DB::table('user_artist')->truncate();

        // albums
        DB::table('albums')->truncate();

        // tracks
        DB::table('tracks')->truncate();
        DB::table('lyrics')->truncate();
        DB::table('reposts')->truncate();
        DB::table('track_plays')->truncate();

        // library
        DB::table('likes')->truncate();

        // channels
        DB::table('channelables')->truncate();

        // playlists
        DB::table('playlists')
            ->where(
                fn($query) => $query
                    ->whereNotNull('spotify_id')
                    ->orWhereNotNull('deezer_id'),
            )
            ->update([
                'spotify_id' => null,
                'deezer_id' => null,
            ]);
        DB::table('playlist_track')->truncate();

        // tags and genres
        DB::table('taggables')->truncate();
        DB::table('genreables')->truncate();
        DB::table('genres')
            ->whereNotNull('deezer_id')
            ->update([
                'deezer_id' => null,
            ]);

        $this->info('Music data truncated successfully.');

        return self::SUCCESS;
    }
}
