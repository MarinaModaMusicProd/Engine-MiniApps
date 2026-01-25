<?php

namespace App\Services\Playlists;

use App\Models\Playlist;
use Common\Files\Actions\Deletion\DeleteEntries;
use Illuminate\Support\Collection;

class DeletePlaylists
{
    /**
     * @param Playlist[]|Collection $playlists
     */
    public function execute($playlists)
    {
        foreach ($playlists as $playlist) {
            if ($uploadedImages = $playlist->uploadedImage->isNotEmpty()) {
                (new DeleteEntries())->execute([
                    'entryIds' => $uploadedImages->pluck('id')->toArray(),
                ]);
            }

            $playlist->tracks()->detach();
            $playlist->delete();
        }
    }
}
