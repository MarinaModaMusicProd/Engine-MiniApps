<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('file_entries', function (Blueprint $table) {
            $table
                ->bigInteger('owner_id')
                ->unsigned()
                ->nullable()
                ->change();
        });
    }
};
