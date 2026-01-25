<?php namespace Common\Auth\Controllers;

use App\Models\User;
use Common\Core\BaseController;
use Illuminate\Support\Facades\Auth;

class FollowersController extends BaseController
{
    public function __construct()
    {
        $this->middleware('auth')->except(['index']);
    }

    public function index(User $user)
    {
        $this->authorize('show', $user);

        $pagination = $user
            ->followers()
            ->withCount(['followers'])
            ->simplePaginate(request('perPage') ?? 20)
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

    public function follow(User $userToFollow)
    {
        if ($userToFollow->id !== Auth::user()->id) {
            Auth::user()
                ->followedUsers()
                ->sync([$userToFollow->id], false);
        }

        return $this->success();
    }

    public function unfollow(User $userToFollow)
    {
        if ($userToFollow->id != Auth::user()->id) {
            Auth::user()->followedUsers()->detach($userToFollow->id);
        }

        return $this->success();
    }
}
