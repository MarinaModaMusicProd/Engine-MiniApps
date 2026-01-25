<?php

namespace App\Services\Users;

use App\Models\ProfileLink;
use App\Models\User;
use App\Models\ProfileDetails;
use Common\Billing\Subscription;

class UserProfileLoader
{
    public function execute(User $user, string|null $loader = null): array
    {
        if ($loader === 'userProfilePage') {
            $user
                ->load(['profile', 'links'])
                ->loadCount(['followers', 'followedUsers']);

            if (!$user->getRelation('profile')) {
                $user->setRelation('profile', new ProfileDetails());
            }
        }

        return [
            'user' => $this->toApiResource($user),
            'loader' => $loader,
        ];
    }

    public function toApiResource(User $user): array
    {
        $resource = [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'image' => $user->image,
            'model_type' => $user::MODEL_TYPE,
        ];

        if ($user->relationLoaded('subscriptions')) {
            $resource['is_pro'] = $user->subscriptions->some(
                fn(Subscription $subscription) => $subscription->valid(),
            );
        }

        if ($user->relationLoaded('profile')) {
            $resource['profile'] = [
                'city' => $user->profile?->city,
                'country' => $user->profile?->country,
                'description' => $user->profile?->description,
            ];
        }

        if ($user->relationLoaded('links')) {
            $resource['links'] = $user->links
                ->map(
                    fn(ProfileLink $link) => [
                        'url' => $link->url,
                        'title' => $link->title,
                    ],
                )
                ->toArray();
        }

        if ($user->followers_count !== null) {
            $resource['followers_count'] = $user->followers_count;
        }

        if ($user->followed_users_count !== null) {
            $resource['followed_users_count'] = $user->followed_users_count;
        }

        return $resource;
    }
}
