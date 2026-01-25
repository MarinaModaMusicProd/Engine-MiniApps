<?php

namespace App\Policies;

use App\Models\User;
use Common\Core\Policies\BasePolicy;

class LyricPolicy extends BasePolicy
{
    public function index(?User $user)
    {
        return $this->hasPermission($user, 'lyrics.view') ||
            $this->hasPermission($user, 'music.view');
    }

    public function show(?User $user)
    {
        return $this->hasPermission($user, 'lyrics.view') ||
            $this->hasPermission($user, 'music.view');
    }

    public function store(User $user)
    {
        return $this->hasPermission($user, 'lyrics.create') ||
            $this->hasPermission($user, 'music.create');
    }

    public function update(User $user)
    {
        return $this->hasPermission($user, 'lyrics.update') ||
            $this->hasPermission($user, 'music.update');
    }

    public function destroy(User $user)
    {
        return $this->hasPermission($user, 'lyrics.delete') ||
            $user->hasPermission('music.update');
    }
}
