<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('artists', function (Blueprint $table) {
            if (!Schema::hasColumn('artists', 'deezer_id')) {
                $table
                    ->bigInteger('deezer_id')
                    ->nullable()
                    ->unsigned()
                    ->unique()
                    ->after('spotify_id');
            }

            $table->boolean('fully_scraped')->nullable()->default(0)->change();

            if (!Schema::hasColumn('artists', 'external_popularity')) {
                $table->renameColumn(
                    'spotify_popularity',
                    'external_popularity',
                );
            }
        });
    }
};
