<?php

namespace Common\Core\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProductPolicy extends BasePolicy
{
    public function index(?User $user): bool|Response
    {
        return true;
    }

    public function show(?User $user): bool|Response
    {
        return true;
    }

    public function store(User $user): bool|Response
    {
        return $this->hasPermission($user, 'subscriptions.update');
    }

    public function update(User $user): bool|Response
    {
        return $this->hasPermission($user, 'subscriptions.update');
    }

    public function destroy(User $user): bool|Response
    {
        return $this->hasPermission($user, 'subscriptions.update');
    }
}
