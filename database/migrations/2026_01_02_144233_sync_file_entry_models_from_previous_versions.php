<?php

use App\Models\Track;
use Common\Files\FileEntry;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        $srcFileEntries = FileEntry::whereIn('type', ['audio', 'video'])->get([
            'id',
            'file_name',
        ]);

        Track::whereNotNull('src')->chunkById(100, function ($tracks) use (
            $srcFileEntries,
        ) {
            foreach ($tracks as $track) {
                $srcFileEntry = $srcFileEntries->first(
                    fn(FileEntry $fileEntry) => str_contains(
                        $track->src,
                        $fileEntry->file_name,
                    ),
                );
                if ($srcFileEntry) {
                    $track->uploadedSrc()->attach($srcFileEntry->id);
                }
            }
        });
    }
};
