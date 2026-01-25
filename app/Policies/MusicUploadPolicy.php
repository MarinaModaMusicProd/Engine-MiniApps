<?php

namespace App\Policies;

use App\Models\User;
use Common\Core\Policies\FileEntryPolicy;

class MusicUploadPolicy extends FileEntryPolicy
{
    public function store(User $user, int|null $parentId = null): bool
    {
        if (
            request('uploadType') === 'media' &&
            ($this->hasPermission($user, 'music.create') ||
                $this->hasPermission($user, 'music.update'))
        ) {
            return true;
        } else {
            return parent::store($user, $parentId);
        }
    }
}
