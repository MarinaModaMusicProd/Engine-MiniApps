<?php namespace App\Console\Commands;

use App\Models\Playlist;
use App\Models\TrackPlay;
use App\Models\User;
use Common\Auth\Permissions\Permission;
use Common\Localizations\Localization;
use Common\Settings\Settings;
use Common\Settings\Themes\CssTheme;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class ResetDemoAdminAccount extends Command
{
    protected $signature = 'demo:reset';
    protected $description = 'Reset admin account';

    public function handle()
    {
        $admin = User::firstOrCreate([
            'email' => 'admin@admin.com',
        ]);
        $adminPermission = Permission::where('name', 'admin')->first();

        $admin->image = null;
        $admin->username = null;
        $admin->name = null;
        $admin->password = 'admin';
        $admin->permissions()->sync($adminPermission->id);
        $admin->save();

        // clear library
        $admin->likedTracks()->detach();
        $admin->likedAlbums()->detach();
        $admin->likedArtists()->detach();

        // clear plays
        TrackPlay::where('user_id', $admin->id)->delete();

        // delete playlists
        $ids = $admin
            ->playlists()
            ->where('owner_id', $admin->id)
            ->select('playlists.id')
            ->pluck('id');
        Playlist::whereIn('id', $ids)->delete();
        DB::table('playlist_track')->whereIn('playlist_id', $ids)->delete();
        DB::table('playlist_user')->whereIn('playlist_id', $ids)->delete();

        // super admin
        $superAdmin = User::firstOrCreate([
            'email' => config('app.demo_email'),
        ]);
        $superAdmin->update(['password' => config('app.demo_password')]);
        $superAdmin->permissions()->sync($adminPermission->id);

        // settings
        if (str_contains(config('app.url'), 'MarinaModa-1')) {
            $darkThemeId = CssTheme::where('default_dark', true)->first()?->id;
            app(Settings::class)->save([
                'themes.default_id' => $darkThemeId ?? 0,
            ]);
        }

        Artisan::call('cache:clear');

        $this->info('Demo site reset.');
    }
}
