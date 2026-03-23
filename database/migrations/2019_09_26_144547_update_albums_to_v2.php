<?php

use Common\Database\Traits\AddsIndexToExistingTable;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateAlbumsToV2 extends Migration
{
    use AddsIndexToExistingTable;

    public function up()
    {
        Schema::table('albums', function (Blueprint $table) {
            if (!Schema::hasColumn('albums', 'description')) {
                $table->text('description')->nullable();
            }

            $this->removeUniqueIndex($table, 'albums_name_artist_id_unique');
        });
    }

    public function down()
    {
        Schema::table('albums', function (Blueprint $table) {
            $table->dropColumn('description');
        });
    }
}
