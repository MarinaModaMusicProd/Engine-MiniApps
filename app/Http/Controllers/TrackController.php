<?php namespace App\Http\Controllers;

use App\Http\Requests\ModifyTracks;
use App\Models\Track;
use App\Services\Tracks\CrupdateTrack;
use App\Services\Tracks\DeleteTracks;
use App\Services\Tracks\TrackLoader;
use App\Services\Tracks\PaginateTracks;
use Common\Core\BaseController;
use Illuminate\Http\Request;

class TrackController extends BaseController
{
    public function __construct(
        protected Track $track,
        protected Request $request,
    ) {}

    public function index()
    {
        $this->authorize('index', Track::class);

        $builder = Track::query()->with('lyric');

        $pagination = (new PaginateTracks())->asApiResponse(
            request()->all(),
            builder: $builder,
            loader: 'editTrackDatatable',
        );

        return $this->success(['pagination' => $pagination]);
    }

    public function show(Track $track)
    {
        $this->authorize('show', $track);

        $loader = request('loader', 'trackPage');
        $data = (new TrackLoader())->load($track, $loader);

        return $this->renderClientOrApi([
            'pageName' => $loader === 'trackPage' ? 'track-page' : null,
            'data' => $data,
        ]);
    }

    public function store(ModifyTracks $request)
    {
        $this->authorize('store', Track::class);

        $this->blockOnDemoSite();

        $track = app(CrupdateTrack::class)->execute(
            $request->all(),
            null,
            $request->get('album'),
        );

        return $this->success(['track' => $track]);
    }

    public function update(int $id, ModifyTracks $request)
    {
        $track = $this->track->findOrFail($id);

        $this->authorize('update', $track);

        $this->blockOnDemoSite();

        $track = app(CrupdateTrack::class)->execute(
            $request->all(),
            $track,
            $request->get('album'),
        );

        return $this->success(['track' => $track]);
    }

    public function destroy(string $ids)
    {
        $trackIds = explode(',', $ids);
        $this->authorize('destroy', [Track::class, $trackIds]);

        $this->blockOnDemoSite();

        app(DeleteTracks::class)->execute($trackIds);

        return $this->success();
    }
}
