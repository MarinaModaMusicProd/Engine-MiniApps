<?php namespace App\Http\Controllers;

use App\Http\Requests\ModifyAlbums;
use App\Models\Album;
use App\Services\Albums\CrupdateAlbum;
use App\Services\Albums\DeleteAlbums;
use App\Services\Albums\AlbumLoader;
use App\Services\Albums\PaginateAlbums;
use App\Services\IncrementModelViews;
use Common\Core\BaseController;
use Illuminate\Http\Request;

class AlbumController extends BaseController
{
    public function __construct(protected Request $request) {}

    public function index()
    {
        $this->authorize('index', Album::class);

        $pagination = (new PaginateAlbums())->asApiResponse(
            request()->all(),
            includeScheduled: true,
            loader: 'editAlbumDatatable',
        );

        return $this->success(['pagination' => $pagination]);
    }

    public function show(Album $album)
    {
        $this->authorize('show', $album);

        $loader = request('loader', 'albumPage');
        $data = (new AlbumLoader())->load($album, $loader);

        (new IncrementModelViews())->execute($album->id, 'album');

        return $this->renderClientOrApi([
            'pageName' => $loader === 'albumPage' ? 'album-page' : null,
            'data' => $data,
        ]);
    }

    public function update(Album $album, ModifyAlbums $request)
    {
        $this->authorize('update', $album);

        $this->blockOnDemoSite();

        $album = app(CrupdateAlbum::class)->execute($request->all(), $album);

        return $this->success(['album' => $album]);
    }

    public function store(ModifyAlbums $request)
    {
        $this->authorize('store', Album::class);

        $this->blockOnDemoSite();

        $album = app(CrupdateAlbum::class)->execute($request->all());

        return $this->success(['album' => $album]);
    }

    public function destroy(string $ids)
    {
        $albumIds = explode(',', $ids);
        $this->authorize('destroy', [Album::class, $albumIds]);

        $this->blockOnDemoSite();

        app(DeleteAlbums::class)->execute($albumIds);

        return $this->success();
    }
}
