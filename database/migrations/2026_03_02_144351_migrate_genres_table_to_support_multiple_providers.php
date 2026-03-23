<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('genres', function (Blueprint $table) {
            if (!Schema::hasColumn('genres', 'deezer_id')) {
                $table
                    ->bigInteger('deezer_id')
                    ->nullable()
                    ->unsigned()
                    ->unique()
                    ->after('name');
            }

            if (!Schema::hasColumn('genres', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }

            if (!Schema::hasColumn('genres', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });
    }
};
