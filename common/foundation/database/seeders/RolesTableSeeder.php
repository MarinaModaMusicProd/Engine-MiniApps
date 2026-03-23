<?php namespace Common\Database\Seeders;

use App\Models\User;
use Common\Auth\Permissions\Permission;
use Common\Auth\Permissions\Traits\SyncsPermissions;
use Common\Auth\Roles\Role;
use Illuminate\Database\Seeder;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;

class RolesTableSeeder extends Seeder
{
    use SyncsPermissions;

    private array $commonConfig = [];
    private array $appConfig = [];

    public function __construct(
        protected Role $role,
        protected User $user,
        protected Permission $permission,
        protected Filesystem $fs,
    ) {}

    public function run(): void
    {
        $this->appConfig = File::getRequire(
            resource_path('defaults/permissions.php'),
        );

        foreach ($this->appConfig['roles'] as $appRole) {
            $this->createOrUpdateRole($appRole);
        }
    }

    private function createOrUpdateRole(array $appRole): Role
    {
        $defaultPermissions = collect($appRole['permissions']);
        $defaultPermissionsNames = $defaultPermissions->map(
            fn($p) => is_array($p) ? $p['name'] : $p,
        );

        $dbPermissions = Permission::whereIn('name', $defaultPermissionsNames)
            ->get()
            ->map(function (Permission $permission) use ($defaultPermissions) {
                $restrictions =
                    $defaultPermissions->first(
                        fn($p) => is_array($p) &&
                            $p['name'] === $permission->name,
                    )['restrictions'] ?? [];
                $permission['restrictions'] = $restrictions;
                return $permission;
            });

        if (Arr::get($appRole, 'default')) {
            $attributes = ['default' => true];
            Role::where('name', $appRole['name'])->update([
                'default' => true,
                'internal' => true,
                'type' => $appRole['type'],
            ]);
        } elseif (Arr::get($appRole, 'guests')) {
            $attributes = ['guests' => true];
            Role::where('name', $appRole['name'])->update([
                'guests' => true,
                'internal' => true,
                'type' => $appRole['type'],
            ]);
        } elseif (isset($appRole['extraColumns'])) {
            $attributes = Arr::mapWithKeys(
                $appRole['extraColumns'],
                fn($column) => [$column['name'] => $column['value']],
            );
            $attributes['type'] = $appRole['type'];
            $attributes['internal'] = $appRole['internal'] ?? false;
            Role::where('name', $appRole['name'])->update($attributes);
        } else {
            $attributes = [
                'name' => $appRole['name'],
                'type' => $appRole['type'],
            ];
        }

        if ($role = Role::where($attributes)->first()) {
            return $role;
        } else {
            $extraColumns = isset($appRole['extraColumns'])
                ? Arr::mapWithKeys(
                    $appRole['extraColumns'],
                    fn($column) => [$column['name'] => $column['value']],
                )
                : [];
            $role = $this->role->create([
                ...$extraColumns,
                'name' => $appRole['name'],
                'type' => $appRole['type'],
                'internal' => $appRole['internal'] ?? false,
                'default' => $appRole['default'] ?? false,
                'guests' => $appRole['guests'] ?? false,
            ]);
            $this->syncPermissions(
                $role,
                $role->permissions->concat($dbPermissions),
            );
            $role->save();

            return $role;
        }
    }
}
