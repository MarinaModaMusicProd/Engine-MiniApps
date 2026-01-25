<?php

namespace App\Http\Controllers\Artist;

use App\Models\Artist;
use App\Services\Artists\ArtistLoader;
use Common\Core\BaseController;
use Illuminate\Http\Request;

class ArtistFollowersController extends BaseController
{
    public function index(Artist $artist)
    {
        $this->authorize('show', $artist);

        $pagination = (new ArtistLoader())->loadArtistFollowers($artist);

        return $this->success(['pagination' => $pagination]);
    }
}
