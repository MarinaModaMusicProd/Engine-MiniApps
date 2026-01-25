<?php namespace App\Http\Controllers;

use App\Models\Artist;
use App\Services\Artists\ArtistLoader;
use Common\Core\BaseController;

class ArtistAlbumsController extends BaseController
{
    public function index(Artist $artist)
    {
        $this->authorize('show', $artist);

        return $this->success([
            'pagination' => (new ArtistLoader())->paginateArtistAlbums(
                $artist,
                viewMode: request('viewMode', 'grid'),
                page: request('page', 1),
            ),
        ]);
    }
}
