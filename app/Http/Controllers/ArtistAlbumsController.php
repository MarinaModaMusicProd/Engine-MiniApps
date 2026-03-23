<?php namespace App\Http\Controllers;

use App\Models\Artist;
use App\Services\Albums\PaginateAlbums;
use App\Services\Artists\ArtistAlbumsResponseType;
use App\Services\Artists\ArtistLoader;
use Common\Core\BaseController;

class ArtistAlbumsController extends BaseController
{
    public function index(Artist $artist)
    {
        $this->authorize('show', $artist);

        $responseType = request('responseType', ArtistAlbumsResponseType::GRID);
        $recordType = request('recordType');
        $perPage =
            $responseType === ArtistAlbumsResponseType::GRID->value ? 25 : 5;
        $page = request('page', 1);

        $pagination = (new PaginateAlbums())->asApiResponse(
            [
                'perPage' => $perPage,
                'paginate' => 'simple',
                'page' => $page,
            ],
            $artist
                ->albums()
                ->when(
                    $recordType,
                    fn($query) => $query->where('record_type', $recordType),
                ),
            includeTracks: $responseType ===
                ArtistAlbumsResponseType::WITH_TRACKS->value,
        );

        return $this->success([
            'artist' => (new ArtistLoader())->toApiResource($artist),
            'pagination' => $pagination,
        ]);
    }
}
