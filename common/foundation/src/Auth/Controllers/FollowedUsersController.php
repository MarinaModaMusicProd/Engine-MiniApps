<?php

namespace Common\Auth\Controllers;

use App\Models\User;
use Common\Core\BaseController;

class FollowedUsersController extends BaseController
{
    public function index(User $user)
    {
        $this->authorize('show', $user);

        $pagination = $user
            ->followedUsers()
            ->withCount(['followers'])
            ->paginate(request('perPage', 20))
            ->through(
                fn($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'image' => $user->image,
                    'followers_count' => $user->followers_count,
                    'model_type' => User::MODEL_TYPE,
                ],
            );

        return $this->success(['pagination' => $pagination]);
    }

    public function ids(User $user)
    {
        $this->authorize('show', $user);

        $ids = $user->followedUsers()->pluck('id');

        return $this->success(['ids' => $ids]);
    }
}
