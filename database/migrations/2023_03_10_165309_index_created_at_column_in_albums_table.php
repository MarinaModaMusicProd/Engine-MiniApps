<?php

use Common\Database\Traits\AddsIndexToExistingTable;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    use AddsIndexToExistingTable;

    public function up()
    {
        Schema::table('albums', function (Blueprint $table) {
            $this->addIndexIfDoesNotExist($table, 'created_at');
        });
    }

    public function down()
    {
        //
    }
};
