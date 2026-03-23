<?php

namespace Common\Files\Actions\Deletion;

use Common\Files\Actions\Deletion\SoftDeleteEntries;
use Common\Files\Events\FileEntriesRestored;
use Common\Files\FileEntry;
use Illuminate\Support\Collection;

class RestoreEntries extends SoftDeleteEntries
{
    public function execute(Collection|array $entryIds): void
    {
        $entries = FileEntry::query()
            ->onlyTrashed()
            ->whereIn('id', $entryIds)
            ->get();

        $this->chunkChildEntries($entries, function ($chunk) {
            FileEntry::whereIn('id', $chunk->pluck('id'))->restore();
            event(new FileEntriesRestored($chunk->pluck('id')->toArray()));
        });
    }
}
