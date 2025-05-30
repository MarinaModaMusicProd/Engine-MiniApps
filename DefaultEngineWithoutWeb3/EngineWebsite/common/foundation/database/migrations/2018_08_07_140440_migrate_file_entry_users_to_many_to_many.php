<?php

use Illuminate\Database\Eloquent\Collection;
use Common\Files\FileEntry;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up()
    {
        if (!Schema::hasTable('user_file_entry')) {
            return;
        }

        FileEntry::select('id', 'user_id')
            ->orderBy('id')
            ->chunk(50, function (Collection $entries) {
                $records = $entries->map(function (FileEntry $entry) {
                    return [
                        'file_entry_id' => $entry->id,
                        'user_id' => $entry->user_id,
                        'owner' => 1,
                    ];
                });

                DB::table('user_file_entry')->insert($records->toArray());
            });
    }
};
