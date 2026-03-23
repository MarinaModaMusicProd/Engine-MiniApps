<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('playlists', function (Blueprint $table) {
            if (!Schema::hasColumn('playlists', 'deezer_id')) {
                $table
                    ->bigInteger('deezer_id')
                    ->nullable()
                    ->unsigned()
                    ->unique()
                    ->after('spotify_id');
            }
        });
    }
};
