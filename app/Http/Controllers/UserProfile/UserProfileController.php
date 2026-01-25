<?php

namespace App\Http\Controllers\UserProfile;

use App\Models\User;
use App\Services\Users\UserProfileLoader;
use Common\Auth\Actions\UpdateUser;
use Common\Core\BaseController;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;

class UserProfileController extends BaseController
{
    public function show(User $user)
    {
        $this->authorize('show', $user);

        $loader = request('loader', 'userProfilePage');
        $data = (new UserProfileLoader())->execute($user, $loader);

        return $this->renderClientOrApi([
            'pageName' =>
                $loader === 'userProfilePage' ? 'user-profile-page' : null,
            'data' => $data,
        ]);
    }

    public function update()
    {
        $user = Auth::user();
        $this->authorize('update', $user);

        $userData = request('user');

        $profileData = request('profile');

        $user = (new UpdateUser())->execute(
            $user,
            Arr::only($userData, [
                'image',
                'image_entry_id',
                'name',
                'username',
            ]),
        );

        $profile = $user
            ->profile()
            ->updateOrCreate(['user_id' => $user->id], $profileData);

        $user->links()->delete();
        $links = $user->links()->createMany(request('links'));

        $user->setRelation('profile', $profile);
        $user->setRelation('links', $links);

        return $this->success(['user' => $user]);
    }
}
