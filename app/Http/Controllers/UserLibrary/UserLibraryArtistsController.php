<?php namespace App\Http\Controllers\UserLibrary;

use App\Models\User;
use App\Services\Artists\PaginateArtists;
use Auth;
use Common\Core\BaseController;
use Common\Database\Datasource\Datasource;

class UserLibraryArtistsController extends BaseController
{
    public function index(User $user)
    {
        $this->authorize('show', $user);

        $params = $this->validate(request(), [
            'orderBy' => 'string',
            'orderDir' => 'string',
            'query' => 'string|nullable',
        ]);
        $params['perPage'] = 30;

        $pagination = (new PaginateArtists())->asApiResponse(
            [
                'perPage' => $params['perPage'],
                'orderBy' => $params['orderBy'] ?? 'likes.created_at',
                'orderDir' => $params['orderDir'] ?? 'desc',
                'query' => $params['query'] ?? null,
            ],
            builder: $user->likedArtists(),
        );

        return $this->success(['pagination' => $pagination]);
    }
}
