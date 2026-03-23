<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->string('type', 20)->default('users')->change();
        });

        Schema::table('permissions', function (Blueprint $table) {
            if (Schema::hasColumn('permissions', 'type')) {
                $table->dropColumn('type');
            }
        });

        DB::table('roles')
            ->where('type', 'sitewide')
            ->update(['type' => 'users']);
    }
};
