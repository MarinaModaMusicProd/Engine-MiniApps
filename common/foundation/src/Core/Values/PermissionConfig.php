<?php

namespace Common\Core\Values;

use Common\Auth\Permissions\Permission;
use Illuminate\Support\Facades\Auth;

class PermissionConfig
{
    // unique flag is in case we need a different description or restrictions for same permission
    // on different role types. For example "files.create" permission for users and workspace.
    // unique:false should only be called in the "getWithId" method here, role_type param will filter out duplicates.
    public function get(bool $unique = true): array
    {
        $permissionConfig = require resource_path('defaults/permissions.php');

        $flatPermissions = [];

        foreach ($permissionConfig['all'] as $groupName => $group) {
            foreach ($group as $permission) {
                $permission['group'] = $groupName;
                if ($unique) {
                    $flatPermissions[$permission['name']] = $permission;
                } else {
                    $flatPermissions[] = $permission;
                }
            }
        }

        return array_values($flatPermissions);
    }

    public function getWithId(string $roleType): array
    {
        $config = $this->get(unique: false);
        $permissions = Permission::get();
        $filteredPermissions = [];

        foreach ($config as $key => $permission) {
            $dbPermission = $permissions->first(
                fn(Permission $dbPermission) => $dbPermission->name ===
                    $permission['name'],
            );
            $config[$key]['id'] = $dbPermission->id;

            if (!in_array($roleType, $permission['role_types'])) {
                continue;
            }

            if (
                $permission['name'] === 'admin' &&
                (!Auth::user() || !Auth::user()->hasExactPermission('admin'))
            ) {
                continue;
            }

            $filteredPermissions[] = $config[$key];
        }

        return $filteredPermissions;
    }
}
