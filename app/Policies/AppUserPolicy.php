<?php

namespace App\Policies;

use App\Models\User;
use Common\Core\Policies\UserPolicy;

class AppUserPolicy extends UserPolicy
{
    public function index(?User $user)
    {
        return $this->hasPermission($user, 'music.view') ||
            parent::index($user);
    }

    public function show(?User $current, User $requested)
    {
        return $this->hasPermission($current, 'music.view') ||
            parent::show($current, $requested);
    }
}
