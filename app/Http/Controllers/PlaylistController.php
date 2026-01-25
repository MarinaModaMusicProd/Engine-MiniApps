<?php namespace App\Http\Controllers;

use App\Http\Requests\ModifyPlaylist;
use App\Models\Playlist;
use App\Services\IncrementModelViews;
use App\Services\Playlists\DeletePlaylists;
use App\Services\Playlists\PaginatePlaylists;
use App\Services\Playlists\PlaylistLoader;
use Common\Core\BaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class PlaylistController extends BaseController
{
    public function __construct(
        protected Request $request,
        protected Playlist $playlist,
    ) {}

    public function index()
    {
        $this->authorize('index', Playlist::class);

        $pagination = (new PaginatePlaylists())->asApiResponse(
            request()->all(),
        );

        return $this->success(['pagination' => $pagination]);
    }

    public function show(int $id)
    {
        $playlist = Playlist::findOrFail($id);

        $this->authorize('show', $playlist);

        $loader = request('loader', 'playlistPage');
        $data = (new PlaylistLoader())->load($playlist, $loader);

        app(IncrementModelViews::class)->execute($playlist->id, 'playlist');

        return $this->renderClientOrApi([
            'pageName' => $loader === 'playlistPage' ? 'playlist-page' : null,
            'data' => $data,
        ]);
    }

    public function store(ModifyPlaylist $validate): Response
    {
        $this->authorize('store', Playlist::class);

        $params = request()->all();
        $params['owner_id'] = Auth::id();
        $newPlaylist = request()
            ->user()
            ->playlists()
            ->create($params, ['editor' => true]);

        $newPlaylist->syncUploadedImage();

        $newPlaylist->load('editors');

        return $this->success([
            'playlist' => (new PlaylistLoader())->toApiResource($newPlaylist),
        ]);
    }

    public function update(
        Playlist $playlist,
        ModifyPlaylist $validate,
    ): Response {
        $this->authorize('update', $playlist);

        $initialImage = $playlist->image;

        $playlist->fill($this->request->all())->save();
        $playlist->load('editors');

        $playlist->syncUploadedImage($initialImage);

        return $this->success([
            'playlist' => (new PlaylistLoader())->toApiResource($playlist),
        ]);
    }

    public function destroy(string $ids): Response
    {
        $playlistIds = explode(',', $ids);
        $playlists = $this->playlist
            ->with('editors')
            ->whereIn('id', $playlistIds)
            ->get();

        $this->authorize('destroy', [Playlist::class, $playlists]);

        $this->blockOnDemoSite();

        app(DeletePlaylists::class)->execute($playlists);

        return $this->success();
    }

    public function follow(int $id)
    {
        $playlist = $this->playlist->findOrFail($id);

        $this->authorize('show', $playlist);

        return $this->request
            ->user()
            ->playlists()
            ->sync([$id], false);
    }

    public function unfollow(int $id)
    {
        $playlist = $this->request->user()->playlists()->find($id);

        $this->authorize('show', $playlist);

        if ($playlist) {
            $this->request->user()->playlists()->detach($id);
        }

        return $this->success();
    }
}
