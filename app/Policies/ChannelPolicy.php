<?php namespace App\Policies;

use App\Models\Channel;
use App\Models\User;
use Common\Core\Exceptions\AccessResponseWithPermission;
use Common\Core\Policies\BasePolicy;

class ChannelPolicy extends BasePolicy
{
    public function index(?User $user, $userId = null)
    {
        return $this->hasPermission($user, 'channels.view') ||
            $user->id === (int) $userId;
    }

    public function show(?User $user, ?Channel $channel = null)
    {
        if (
            $this->hasPermission($user, 'channels.view') ||
            $this->hasPermission($user, 'music.view') ||
            $channel?->user_id === $user->id
        ) {
            return true;
        } else {
            return new AccessResponseWithPermission(
                false,
                'music.view',
                '',
                403,
            );
        }
    }

    public function store(User $user)
    {
        return $this->hasPermission($user, 'channels.create');
    }

    public function update(User $user, ?Channel $channel = null)
    {
        return $this->hasPermission($user, 'channels.update') ||
            $channel?->user_id === $user->id;
    }

    public function destroy(User $user, $channelIds = null)
    {
        if ($this->hasPermission($user, 'channels.update')) {
            return true;
        } else {
            $dbCount = app(Channel::class)
                ->whereIn('id', $channelIds)
                ->where('user_id', $user->id)
                ->count();
            return $dbCount === count($channelIds);
        }
    }
}
