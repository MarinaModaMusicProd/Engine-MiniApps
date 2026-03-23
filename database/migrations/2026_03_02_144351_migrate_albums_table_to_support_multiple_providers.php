<?php

use Common\Settings\Settings;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // migrate provider settings as well
        if (!settings('metadata_provider')) {
            if ($oldProvider = settings('artist_provider')) {
                app(Settings::class)->save([
                    'metadata_provider' => $oldProvider,
                ]);
            }
        }

        if (settings('search_provider') === 'spotify') {
            app(Settings::class)->save([
                'search_provider' => 'external',
            ]);
        } elseif (settings('search_provider') === 'localAndSpotify') {
            app(Settings::class)->save([
                'search_provider' => 'localAndExternal',
            ]);
        }

        Schema::table('albums', function (Blueprint $table) {
            if (!Schema::hasColumn('albums', 'deezer_id')) {
                $table
                    ->bigInteger('deezer_id')
                    ->nullable()
                    ->unsigned()
                    ->unique()
                    ->after('spotify_id');
            }

            if (!Schema::hasColumn('albums', 'upc')) {
                $table
                    ->string('upc', 20)
                    ->nullable()
                    ->unique()
                    ->after('deezer_id');
            }

            if (!Schema::hasColumn('albums', 'record_type')) {
                $table
                    ->string('record_type', 15)
                    ->default('album')
                    ->after('upc');
            }

            if (!Schema::hasColumn('albums', 'explicit')) {
                $table
                    ->boolean('explicit')
                    ->default(false)
                    ->after('record_type');
            }

            $table->boolean('fully_scraped')->nullable()->default(0)->change();

            if (!Schema::hasColumn('albums', 'external_popularity')) {
                $table->renameColumn(
                    'spotify_popularity',
                    'external_popularity',
                );
            }
        });
    }
};
