<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('track_plays', function (Blueprint $table) {
            $table->index(['user_id', 'track_id', 'created_at']);
        });
    }
};
