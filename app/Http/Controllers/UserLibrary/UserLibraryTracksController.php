<?php namespace App\Http\Controllers\UserLibrary;

use App\Models\User;
use App\Services\Tracks\PaginateTracks;
use App\Services\Tracks\Queries\LibraryTracksQuery;
use Carbon\Carbon;
use Common\Core\BaseController;
use Common\Database\Paginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserLibraryTracksController extends BaseController
{
    public function __construct()
    {
        $this->middleware('auth')->only(['addToLibrary', 'removeFromLibrary']);
    }

    public function index(User $user)
    {
        $this->authorize('show', $user);

        $params = $this->validate(request(), [
            'orderBy' => 'string',
            'orderDir' => 'string',
            'query' => 'string|nullable',
        ]);
        $params['perPage'] = 30;

        $builder = (new LibraryTracksQuery([
            'orderBy' => $params['orderBy'] ?? 'likes.created_at',
            'orderDir' => $params['orderDir'] ?? 'desc',
        ]))->get($user->id);

        $paginator = (new PaginateTracks())->asApiResponse(
            $params,
            $builder,
            hasCustomOrder: true,
        );

        return $this->success(['pagination' => $paginator]);
    }

    public function addToLibrary()
    {
        $likeableIds = collect(request('likeables'))->pluck('likeable_id');
        $likeableType = request('likeables')[0]['likeable_type'];

        $existing = DB::table('likes')
            ->where('user_id', Auth::id())
            ->whereIn('likeable_id', $likeableIds)
            ->where('likeable_type', $likeableType)
            ->get();

        $idsToAttach = $likeableIds->diff($existing->pluck('likeable_id'));

        DB::table('likes')->insert(
            $idsToAttach
                ->map(
                    fn($id) => [
                        'user_id' => Auth::id(),
                        'likeable_id' => $id,
                        'likeable_type' => $likeableType,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                )
                ->toArray(),
        );

        return $this->success();
    }

    public function removeFromLibrary()
    {
        $this->validate(request(), [
            'likeables.*.likeable_id' => 'required|int',
            'likeables.*.likeable_type' => 'required|in:track,album,artist',
        ]);

        $userId = Auth::id();
        $values = collect(request()->get('likeables'))
            ->map(function ($likeable) use ($userId) {
                return "('$userId', '{$likeable['likeable_id']}', '{$likeable['likeable_type']}')";
            })
            ->implode(', ');
        DB::table('likes')
            ->whereRaw("(user_id, likeable_id, likeable_type) in ($values)")
            ->delete();
        return $this->success();
    }
}
