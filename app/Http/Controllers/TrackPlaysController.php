<?php namespace App\Http\Controllers;

use App\Models\Track;
use App\Services\Tracks\LogTrackPlay;
use App\Services\Tracks\PaginateTracks;
use App\Services\Tracks\Queries\HistoryTrackQuery;
use Common\Core\BaseController;
use Illuminate\Support\Facades\Auth;

class TrackPlaysController extends BaseController
{
    public function index($userId)
    {
        $userId = $userId == 'me' ? Auth::id() : $userId;

        $params = $this->validate(request(), [
            'query' => 'string|nullable',
            'page' => 'integer',
        ]);
        $params['perPage'] = 30;

        $builder = (new HistoryTrackQuery([
            'orderBy' => 'latest_plays.id',
            'orderDir' => 'desc',
        ]))->get($userId);

        $pagination = (new PaginateTracks())->asApiResponse(
            $params,
            $builder,
            hasCustomOrder: true,
        );

        return $this->success(['pagination' => $pagination]);
    }

    public function create(Track $track)
    {
        $this->authorize('show', $track);

        (new LogTrackPlay())->execute($track, request()->get('queueId'));

        return $this->success();
    }
}
