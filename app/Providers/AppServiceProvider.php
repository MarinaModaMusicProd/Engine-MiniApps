<?php

namespace App\Providers;

use App\Listeners\DeleteModelsRelatedToUser;
use App\Models\Album;
use App\Models\Artist;
use App\Models\Channel;
use App\Models\Genre;
use App\Models\Playlist;
use App\Models\Track;
use App\Models\User;
use App\Policies\MusicUploadPolicy;
use App\Policies\TrackCommentPolicy;
use App\Services\Admin\GetAnalyticsHeaderData;
use App\Services\AppBootstrapData;
use App\Services\AppValueLists;
use App\Services\Providers\Spotify\SpotifyHttpClient;
use App\Services\UrlGenerator;
use Common\Admin\Analytics\Actions\GetAnalyticsHeaderDataAction;
use Common\Auth\Events\UsersDeleted;
use Common\Channels\UpdateAllChannelsContent;
use Common\Comments\Comment;
use Common\Core\Bootstrap\BootstrapData;
use Common\Core\Contracts\AppUrlGenerator;
use Common\Core\Values\ValueLists;
use Common\Files\FileEntry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Model::preventLazyLoading(!app()->isProduction());

        Relation::enforceMorphMap([
            Artist::MODEL_TYPE => Artist::class,
            Album::MODEL_TYPE => Album::class,
            Track::MODEL_TYPE => Track::class,
            Playlist::MODEL_TYPE => Playlist::class,
            Genre::MODEL_TYPE => Genre::class,
            User::MODEL_TYPE => User::class,
        ]);

        Gate::policy(FileEntry::class, MusicUploadPolicy::class);
        Gate::policy(Comment::class, TrackCommentPolicy::class);

        Route::bind('channel', function (
            $idOrSlug,
            \Illuminate\Routing\Route $route,
        ) {
            if ($route->getActionMethod() === 'destroy') {
                $channelIds = explode(',', $idOrSlug);
                return app(Channel::class)->whereIn('id', $channelIds)->get();
            } elseif (ctype_digit($idOrSlug)) {
                return app(Channel::class)->findOrFail($idOrSlug);
            } else {
                return app(Channel::class)
                    ->where('slug', $idOrSlug)
                    ->firstOrFail();
            }
        });

        $this->commands([UpdateAllChannelsContent::class]);
    }

    public function register()
    {
        $this->app->bind(BootstrapData::class, AppBootstrapData::class);

        $this->app->bind(
            GetAnalyticsHeaderDataAction::class,
            GetAnalyticsHeaderData::class,
        );

        $this->app->bind(AppUrlGenerator::class, UrlGenerator::class);

        $this->app->bind(ValueLists::class, AppValueLists::class);

        $this->app->singleton(SpotifyHttpClient::class, function () {
            return new SpotifyHttpClient();
        });

        Event::listen(UsersDeleted::class, DeleteModelsRelatedToUser::class);
    }
}
