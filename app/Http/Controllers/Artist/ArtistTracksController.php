<?php

namespace App\Http\Controllers\Artist;

use App\Models\Artist;
use App\Services\Artists\ArtistLoader;
use Common\Core\BaseController;

class ArtistTracksController extends BaseController
{
    public function index(Artist $artist)
    {
        $userId = request('userId');
        $this->authorize('index', [$artist, $userId]);

        $pagination = (new ArtistLoader())->paginateArtistTracks(
            $artist,
            page: request('page', 1),
        );

        return $this->success(['pagination' => $pagination]);
    }
}
