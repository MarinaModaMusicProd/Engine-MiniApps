<?php

use Common\Database\Traits\AddsIndexToExistingTable;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    use AddsIndexToExistingTable;

    public function up()
    {
        Schema::table('tracks', function (Blueprint $table) {
            $this->addIndexIfDoesNotExist($table, 'updated_at');
            $this->addIndexIfDoesNotExist($table, 'name');
        });
        Schema::table('artists', function (Blueprint $table) {
            $this->addIndexIfDoesNotExist($table, 'updated_at');
        });
        Schema::table('albums', function (Blueprint $table) {
            $this->addIndexIfDoesNotExist($table, 'updated_at');
        });
        Schema::table('track_plays', function (Blueprint $table) {
            $this->addIndexIfDoesNotExist($table, 'created_at');
        });
    }

    public function down()
    {
        //
    }
};
