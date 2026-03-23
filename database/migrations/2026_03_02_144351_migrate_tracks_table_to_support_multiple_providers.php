<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tracks', function (Blueprint $table) {
            if (!Schema::hasColumn('tracks', 'deezer_id')) {
                $table
                    ->bigInteger('deezer_id')
                    ->nullable()
                    ->unsigned()
                    ->unique()
                    ->after('spotify_id');
            }

            if (!Schema::hasColumn('tracks', 'isrc')) {
                $table
                    ->string('isrc', 20)
                    ->nullable()
                    // on deezer multiple tracks with different deezer_id can have the same isrc, so it can't be unique
                    ->index()
                    ->after('deezer_id');
            }

            if (!Schema::hasColumn('tracks', 'explicit')) {
                $table->boolean('explicit')->default(false)->after('plays');
            }

            $table->tinyInteger('number')->unsigned()->nullable()->change();

            if (!Schema::hasColumn('tracks', 'external_popularity')) {
                $table->renameColumn(
                    'spotify_popularity',
                    'external_popularity',
                );
            }
        });
    }
};
