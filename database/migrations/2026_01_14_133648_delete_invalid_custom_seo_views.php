<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!File::exists(storage_path('app/editable-views/seo-tags'))) {
            return;
        }

        $files = File::allFiles(storage_path('app/editable-views/seo-tags'));
        foreach ($files as $file) {
            $contents = file_get_contents($file->getPathname());
            if (
                str_contains($contents, '$album->name') ||
                str_contains($contents, '$artist->name') ||
                str_contains($contents, '$track->name') ||
                str_contains($contents, '$playlist->name') ||
                str_contains($contents, '$channel->config')
            ) {
                File::delete($file->getPathname());
            }
        }
    }
};
