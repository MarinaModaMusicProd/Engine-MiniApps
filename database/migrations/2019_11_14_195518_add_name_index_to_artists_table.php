<?php

use Common\Database\Traits\AddsIndexToExistingTable;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddNameIndexToArtistsTable extends Migration
{
    use AddsIndexToExistingTable;

    public function up()
    {
        Schema::table('artists', function (Blueprint $table) {
            $this->addIndexIfDoesNotExist($table, 'name');
        });
    }

    public function down()
    {
        Schema::table('artists', function (Blueprint $table) {
            //
        });
    }
}
