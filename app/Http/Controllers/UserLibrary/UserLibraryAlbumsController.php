<?php namespace App\Http\Controllers\UserLibrary;

use App\Models\User;
use App\Services\Albums\PaginateAlbums;
use Common\Core\BaseController;
use Illuminate\Support\Str;

class UserLibraryAlbumsController extends BaseController
{
    public function index(User $user)
    {
        $this->authorize('show', $user);

        $params = $this->validate(request(), [
            'orderBy' => 'string',
            'orderDir' => 'string',
            'query' => 'string|nullable',
            'with' => 'string|nullable',
            'page' => 'integer|nullable',
        ]);
        $params['perPage'] = 30;

        $pagination = (new PaginateAlbums())->asApiResponse(
            [
                'perPage' => $params['perPage'],
                'orderBy' => $params['orderBy'] ?? 'likes.created_at',
                'orderDir' => $params['orderDir'] ?? 'desc',
                'query' => $params['query'] ?? null,
                'page' => $params['page'] ?? 1,
            ],
            $user->likedAlbums(),
            includeTracks: isset($params['with']) &&
                Str::contains($params['with'], 'tracks'),
        );

        return $this->success(['pagination' => $pagination]);
    }
}
