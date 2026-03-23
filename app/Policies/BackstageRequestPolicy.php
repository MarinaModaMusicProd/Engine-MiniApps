<?php

namespace App\Policies;

use App\Models\BackstageRequest;
use App\Models\User;
use Common\Core\Policies\BasePolicy;

class BackstageRequestPolicy extends BasePolicy
{
    public function index(User $user, $userId = null)
    {
        return $this->hasPermission($user, 'backstageRequests.view') ||
            $user->id === (int) $userId;
    }

    public function show(User $user, BackstageRequest $backstageRequest)
    {
        if (
            $this->hasPermission($user, 'backstageRequests.update') ||
            $this->hasPermission($user, 'backstageRequests.view')
        ) {
            return true;
        }

        return $backstageRequest->user_id === $user->id;
    }

    public function store(User $user)
    {
        return $this->hasPermission($user, 'backstageRequests.create');
    }

    public function update(User $user, BackstageRequest $backstageRequest)
    {
        return $this->hasPermission($user, 'backstageRequests.update') ||
            $backstageRequest->user_id === $user->id;
    }

    public function destroy(User $user, $backstageRequestIds)
    {
        if ($user->hasPermission('backstageRequests.update')) {
            return true;
        } else {
            $dbCount = app(BackstageRequest::class)
                ->whereIn('id', $backstageRequestIds)
                ->where('user_id', $user->id)
                ->count();
            return $dbCount === count($backstageRequestIds);
        }
    }

    public function approve(User $user, BackstageRequest $backstageRequest)
    {
        return $this->hasPermission($user, 'backstageRequests.update');
    }
}
