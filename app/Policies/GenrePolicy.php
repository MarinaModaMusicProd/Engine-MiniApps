<?php

namespace App\Policies;

use App\Models\User;
use Common\Core\Policies\BasePolicy;

class GenrePolicy extends BasePolicy
{
    public function index(?User $user)
    {
        return $this->hasPermission($user, 'genres.view') ||
            $this->hasPermission($user, 'music.view') ||
            $this->hasPermission($user, 'music.update');
    }

    public function show(?User $user)
    {
        return $this->hasPermission($user, 'genres.view') ||
            $this->hasPermission($user, 'music.view') ||
            $this->hasPermission($user, 'music.update');
    }

    public function store(User $user)
    {
        return $this->hasPermission($user, 'genres.create') ||
            $this->hasPermission($user, 'music.create') ||
            $this->hasPermission($user, 'music.update');
    }

    public function update(User $user)
    {
        return $this->hasPermission($user, 'genres.update') ||
            $this->hasPermission($user, 'music.update');
    }

    public function destroy(User $user)
    {
        return $this->hasPermission($user, 'genres.delete') ||
            $this->hasPermission($user, 'music.update');
    }
}
