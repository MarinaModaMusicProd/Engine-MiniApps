<?php

namespace App\Console\Commands;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Genre;
use App\Models\ProfileLink;
use App\Models\Track;
use App\Models\TrackPlay;
use App\Models\User;
use App\Models\ProfileDetails;
use App\Services\Providers\UpsertsDataIntoDB;
use Carbon\Carbon;
use Common\Auth\Permissions\Permission;
use Common\Auth\Roles\Role;
use Common\Channels\UpdateAllChannelsContent;
use Common\Comments\Comment;
use Common\Core\Install\UpdateActions;
use Common\Files\Traits\HandlesEntryPaths;
use Common\Search\ImportRecordsIntoScout;
use Common\Settings\Settings;
use Common\Tags\Tag;
use Illuminate\Console\Command;
use Illuminate\Console\ConfirmableTrait;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class SeedSampleData extends Command
{
    use UpsertsDataIntoDB, ConfirmableTrait, HandlesEntryPaths;

    protected $signature = 'music:sample {--force : Force the operation to run when in production.}';
    protected $description = 'Seed site with sample music data.';

    // we will manually set comment id to speed up comment path generation
    protected int $lastCommentId = 0;

    private array $trackNames;
    private Collection $genres;
    private array $albumNames;
    private array $artistNames;
    private array $albumImages;
    private array $comments;
    private Collection $commentUsers;
    private array $artistImages;
    private array $trackTempIds;
    private array $albumTempIds;
    private Collection|array $tags;
    private Collection $artists;

    public function handle()
    {
        if (!$this->confirmToProceed()) {
            return;
        }

        Artisan::call('optimize:clear');
        Artisan::call('down');

        @ini_set('memory_limit', '-1');
        @set_time_limit(0);

        $originalScoutDriver = config('scout.driver');
        config()->set('scout.driver', 'null');

        $originalCacheDriver = config('cache.default');
        config()->set('cache.default', 'null');

        $this->recreateDatabase();

        app(Settings::class)->save([
            'billing.enable' => true,
            'billing.paypal.enable' => true,
            'billing.stripe.enable' => true,
            'homepage.type' => 'landingPage',
            'artist_provider' => null,
            'album_provider' => null,
            'player.mobile.auto_open_overlay' => false,
            'player.show_upload_btn' => true,
            'player.enable_repost' => true,
            'player.hide_lyrics' => true,
            'player.enable_offlining' => true,
            'player.show_become_artist_btn' => true,
            'player.seekbar_type' => 'waveform',
            'player.track_comments' => true,
            'artistPage.showDescription' => true,
            'artistPage.showFollowers' => false,
            'player.hide_radio_button' => true,
            'player.hide_video' => true,
            'player.hide_video_button' => false,
            'player.sort_method' => 'local',
            'artistPage.tabs' => json_encode([
                ['id' => 4, 'active' => true],
                ['id' => 5, 'active' => true],
                ['id' => 6, 'active' => true],
                ['id' => 2, 'active' => true],
                ['id' => 3, 'active' => true],
                ['id' => 1, 'active' => false],
            ]),
        ]);

        $this->createAdminAccount();
        $this->loadSampleData();

        $this->commentUsers = $this->createUsers();
        $this->createFollows();

        $this->artists = $this->createArtists();
        $this->attachGenresToModels($this->artists, Artist::MODEL_TYPE);

        $this->info('Decorating artists');
        $bar = $this->output->createProgressBar(count($this->artists));
        foreach ($this->artists as $artist) {
            $this->seedArtistData($artist);
            $bar->advance();
        }
        $bar->finish();
        $this->output->newLine();

        $this->info('Decorating albums');
        $bar = $this->output->createProgressBar(
            Album::whereIn('temp_id', $this->albumTempIds)->count() / 100,
        );

        Album::whereIn('temp_id', $this->albumTempIds)->chunkById(
            100,
            function (Collection $albums) use ($bar) {
                $this->createLikesAndReposts($albums);
                $this->attachGenresToModels($albums, Album::MODEL_TYPE);
                $this->createModelComments($albums);
                $bar->advance();
            },
        );
        $bar->finish();
        $this->output->newLine();

        $this->info('Decorating tracks');
        $bar = $this->output->createProgressBar(
            Track::whereIn('temp_id', $this->trackTempIds)->count() / 100,
        );

        Track::whereIn('temp_id', $this->trackTempIds)->chunkById(
            100,
            function (Collection $tracks) use ($bar) {
                $this->createModelComments($tracks);
                $this->createTrackPlays($tracks);
                $this->createLikesAndReposts($tracks);
                $this->attachGenresToModels($tracks, Track::MODEL_TYPE);
                $this->attachTagsToTracks($tracks);
                $bar->advance();
            },
        );
        $bar->finish();
        $this->output->newLine();

        Artisan::call(UpdateAllChannelsContent::class);

        config()->set('cache.default', $originalCacheDriver);
        config()->set('scout.driver', $originalScoutDriver);

        (new ImportRecordsIntoScout())->execute('*');

        Artisan::call('up');

        if (config('app.env') === 'production') {
            Artisan::call('optimize');
            // demo site is missing logo and some other settings without this
            Artisan::call('cache:clear');
        }
    }

    protected function recreateDatabase()
    {
        Schema::dropAllTables();

        (new UpdateActions())->execute();
    }

    private function createTrackPlays(Collection $createdTracks)
    {
        $plays = $createdTracks
            ->map(function ($track) {
                return TrackPlay::factory()
                    ->count(rand(10, 40))
                    ->make([
                        'user_id' => $this->commentUsers->random()->id,
                        'track_id' => $track['id'],
                    ]);
            })
            ->flatten(1);
        $plays->chunk(200)->each(function ($chunk) {
            $chunk = array_map(function ($play) {
                $play['created_at'] = Carbon::parse(
                    $play['created_at'],
                )->startOfDay();
                return $play;
            }, $chunk->toArray());
            DB::table('track_plays')->insert($chunk);
        });
    }

    protected function seedArtistData(Artist $artist)
    {
        $trackTempId = Str::random(8);
        $this->trackTempIds[] = $trackTempId;

        // create followers
        $likes = $this->commentUsers
            ->random(rand(7, $this->commentUsers->count()))
            ->map(function (User $user) use ($artist) {
                return [
                    'likeable_type' => Artist::MODEL_TYPE,
                    'likeable_id' => $artist->id,
                    'user_id' => $user->id,
                    'created_at' => Carbon::now()->startOfDay(),
                    'updated_at' => Carbon::now()->startOfDay(),
                ];
            });
        DB::table('likes')->insert($likes->toArray());

        // create tracks without album
        $tracks = $this->makeTracks(rand(20, 45), $trackTempId);
        Track::insert($tracks);

        // create and load albums
        $albums = $this->makeAlbums();
        Album::insert($albums);
        $createdAlbumIds = Album::where(
            'temp_id',
            $albums[0]['temp_id'],
        )->pluck('id');

        // create album tracks
        $albumTracks = $createdAlbumIds
            ->map(function ($albumId) use ($trackTempId) {
                return $this->makeTracks(rand(3, 7), $trackTempId, $albumId);
            })
            ->flatten(1);
        Track::insert($albumTracks->toArray());

        $createdTrackIds = app(Track::class)
            ->where('temp_id', $trackTempId)
            ->pluck('id');
        $artist
            ->tracks()
            ->attach($createdTrackIds->toArray(), ['primary' => true]);
        $artist
            ->albums()
            ->attach($createdAlbumIds->toArray(), ['primary' => true]);
    }

    protected function createFollows()
    {
        $follows = $this->commentUsers
            ->take(25)
            ->map(function (User $user) {
                $following = $this->commentUsers
                    ->except($user->id)
                    ->unique()
                    ->random(rand(3, 27));
                return $following->map(function (User $followed) use ($user) {
                    return [
                        'follower_id' => $user->id,
                        'followed_id' => $followed->id,
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ];
                });
            })
            ->flatten(1);

        $followers = $this->commentUsers
            ->take(25)
            ->map(function (User $user) {
                $users = $this->commentUsers
                    ->except($user->id)
                    ->random(rand(1, 7));
                return $users->map(function (User $follower) use ($user) {
                    return [
                        'follower_id' => $follower->id,
                        'followed_id' => $user->id,
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ];
                });
            })
            ->flatten(1);

        $this->upsert($followers->merge($follows)->toArray(), 'follows');
    }

    protected function createLikesAndReposts($likeables)
    {
        $likes = collect($likeables)
            ->map(function ($likeable) {
                $users = $this->commentUsers->random(rand(5, 47));
                return $users->map(function (User $user) use ($likeable) {
                    return [
                        'likeable_id' => $likeable->id,
                        'likeable_type' => $likeable::MODEL_TYPE,
                        'user_id' => $user->id,
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ];
                });
            })
            ->flatten(1);

        DB::table('likes')->insert($likes->toArray());

        $reposts = collect($likeables)
            ->map(function ($likeable) {
                $users = $this->commentUsers->random(rand(5, 47));
                return $users->map(function (User $user) use ($likeable) {
                    return [
                        'repostable_id' => $likeable->id,
                        'repostable_type' => $likeable::MODEL_TYPE,
                        'user_id' => $user->id,
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ];
                });
            })
            ->flatten(1);
        DB::table('reposts')->insert($reposts->toArray());
    }

    protected function loadSampleData()
    {
        $this->trackNames = explode(
            PHP_EOL,
            file_get_contents(resource_path('defaults/demo/track-names.txt')),
        );
        $this->albumNames = explode(
            PHP_EOL,
            file_get_contents(resource_path('defaults/demo/album-names.txt')),
        );
        $this->artistNames = explode(
            PHP_EOL,
            file_get_contents(resource_path('defaults/demo/artist-names.txt')),
        );
        $this->albumImages = explode(
            PHP_EOL,
            file_get_contents(resource_path('defaults/demo/album-images.txt')),
        );
        $this->artistImages = explode(
            PHP_EOL,
            file_get_contents(resource_path('defaults/demo/artist-images.txt')),
        );
        $this->comments = explode(
            PHP_EOL,
            file_get_contents(resource_path('defaults/demo/comments.txt')),
        );

        $genres = collect([
            'blues',
            'rock',
            'country',
            'pop',
            'cinematic',
            'electronic',
            'house',
            'edm',
            'reggae',
            'dubstep',
            'dance',
            'guitar',
            'indie',
            'alternative',
            'folk',
            'jazz',
            'metal',
            'punk',
            'soul',
            'metalcore',
            'hard-rock',
            'piano',
            'classical',
            'funk',
            'grunge',
        ]);
        $genres->transform(function ($genreName) {
            $filename = slugify($genreName) . '.jpg';
            return [
                'name' => $genreName,
                'display_name' => ucwords($genreName),
                'image' => "images/genres/$filename",
            ];
        });
        Genre::insert($genres->toArray());
        $this->genres = Genre::all();

        $tags = collect(['some', 'demo', 'tags']);
        $this->tags = app(Tag::class)->insertOrRetrieve($tags);
    }

    protected function createArtists()
    {
        $artists = Artist::factory()->count(50)->make()->toArray();
        $artists = array_map(function ($artist) {
            unset($artist['model_type']);
            $artist['image_small'] = Arr::random($this->artistImages);
            $artist['name'] = Arr::random($this->artistNames);
            $artist['updated_at'] = Carbon::parse(
                $artist['updated_at'],
            )->startOfDay();
            $artist['created_at'] = Carbon::parse(
                $artist['created_at'],
            )->startOfDay();
            return $artist;
        }, $artists);
        Artist::insert($artists);

        $artists = Artist::whereIn('name', Arr::pluck($artists, 'name'))->get();

        $artistProfiles = $artists->map(function (Artist $artist) {
            $profile = ProfileDetails::factory()->make();
            $profile['artist_id'] = $artist->id;
            return $profile;
        });
        DB::table('profile_details')->insert($artistProfiles->toArray());

        $userLinks = $artists
            ->map(function (Artist $artist) {
                return [
                    [
                        'linkeable_id' => $artist->id,
                        'linkeable_type' => Artist::MODEL_TYPE,
                        'url' => 'https://facebook.com',
                        'title' => 'Facebook',
                    ],
                    [
                        'linkeable_id' => $artist->id,
                        'linkeable_type' => Artist::MODEL_TYPE,
                        'url' => 'https://twitter.com',
                        'title' => 'Twitter',
                    ],
                    [
                        'linkeable_id' => $artist->id,
                        'linkeable_type' => Artist::MODEL_TYPE,
                        'url' => 'https://bandcamp.com',
                        'title' => 'Bandcamp',
                    ],
                ];
            })
            ->flatten(1);
        ProfileLink::insert($userLinks->toArray());
        return $artists;
    }

    protected function createUsers()
    {
        $users = User::factory()
            ->count(50)
            ->make()
            ->map(fn($user) => $user->toArray(true))
            ->toArray();
        $users = array_map(function ($user) {
            unset($user['name'], $user['has_password'], $user['model_type']);

            $rand = rand(1, 10);
            $user['image'] = "images/avatars/{$user['gender']}-$rand.webp";
            $user['email_verified_at'] = Carbon::parse(
                $user['email_verified_at'],
            )->startOfDay();

            return $user;
        }, $users);
        User::insert($users);

        $users = User::whereIn(
            'username',
            Arr::pluck($users, 'username'),
        )->get();

        $userProfiles = $users->map(function (User $user) {
            $profile = ProfileDetails::factory()->make();
            $profile['user_id'] = $user->id;
            return $profile;
        });
        DB::table('profile_details')->insert($userProfiles->toArray());

        $userLinks = $users
            ->map(function (User $user) {
                return [
                    [
                        'linkeable_id' => $user->id,
                        'linkeable_type' => User::MODEL_TYPE,
                        'url' => 'https://facebook.com',
                        'title' => 'Facebook',
                    ],
                    [
                        'linkeable_id' => $user->id,
                        'linkeable_type' => User::MODEL_TYPE,
                        'url' => 'https://twitter.com',
                        'title' => 'Twitter',
                    ],
                    [
                        'linkeable_id' => $user->id,
                        'linkeable_type' => User::MODEL_TYPE,
                        'url' => 'https://bandcamp.com',
                        'title' => 'Bandcamp',
                    ],
                ];
            })
            ->flatten(1);
        ProfileLink::insert($userLinks->toArray());

        return $users;
    }

    private function createModelComments($models)
    {
        $comments = [];
        foreach ($models as $i => $model) {
            $newComments = array_map(function ($comment) use ($model) {
                $percentage = null;
                if (is_a($model, Track::class)) {
                    $ms = random_int(0, $model->duration);
                    $percentage = max(1, (100 * $ms) / $model->duration);
                }

                $comment['id'] = $this->lastCommentId + 1;
                $comment['path'] = $this->encodePath($comment['id']);
                $comment['position'] = $percentage ?? 0;
                $comment['content'] = Arr::random($this->comments);
                $comment['user_id'] = $this->commentUsers->random()->id;
                $comment['created_at'] = Carbon::now()
                    ->subHours(rand(0, 50))
                    ->toDateTimeString();
                $comment['commentable_id'] = $model->id;
                $comment['commentable_type'] =
                    $model['model_type'] === Track::MODEL_TYPE
                        ? Track::MODEL_TYPE
                        : Album::MODEL_TYPE;
                $this->lastCommentId = $this->lastCommentId + 1;
                return $comment;
            }, array_fill(0, 40, []));
            $comments = array_merge($comments, $newComments);
        }

        app(Comment::class)->insert($comments);
    }

    private function makeTracks(
        int $count,
        string $tempId,
        int|null $albumId = null,
    ): array {
        $tracks = Track::factory()->count($count)->make();
        return array_map(function ($track) use ($tempId, $albumId) {
            unset($track['model_type'], $track['created_at_relative']);
            $track['name'] = trim(Arr::random($this->trackNames));
            $track['image'] = Arr::random($this->albumImages);
            $track['updated_at'] = Carbon::parse(
                $track['updated_at'],
            )->startOfDay();
            $track['created_at'] = Carbon::parse(
                $track['created_at'],
            )->startOfDay();
            $track['temp_id'] = $tempId;
            if ($albumId) {
                $track['album_id'] = $albumId;
            }
            return $track;
        }, $tracks->toArray());
    }

    private function makeAlbums(): array
    {
        $albums = Album::factory()->count(30)->make()->toArray();
        $tempId = Str::random(8);
        $this->albumTempIds[] = $tempId;
        $albums = array_map(function ($album) use ($tempId) {
            unset($album['model_type'], $album['created_at_relative']);
            $album['name'] = trim(Arr::random($this->albumNames));
            $album['image'] = Arr::random($this->albumImages);
            $album['updated_at'] = Carbon::parse(
                $album['updated_at'],
            )->startOfDay();
            $album['created_at'] = Carbon::parse(
                $album['created_at'],
            )->startOfDay();
            $album['temp_id'] = $tempId;
            return $album;
        }, $albums);
        return collect($albums)->unique('name')->toArray();
    }

    protected function attachGenresToModels($genreables, $genreableType)
    {
        $pivots = collect($genreables)
            ->map(function ($genreable) use ($genreableType) {
                return $this->genres
                    ->random(3)
                    ->map(function ($genre) use ($genreable, $genreableType) {
                        return [
                            'genre_id' => $genre->id,
                            'genreable_type' => $genreableType,
                            'genreable_id' => $genreable['id'],
                        ];
                    });
            })
            ->flatten(1);
        $this->upsert($pivots, 'genreables');
    }

    protected function createAdminAccount()
    {
        $demoAdmin = User::firstOrNew(
            [
                'email' => 'admin@admin.com',
            ],
            ['email_verified_at' => now()],
        );
        $demoAdmin->name = 'admin';
        $demoAdmin->username = 'admin';
        $demoAdmin->image = null;
        $demoAdmin->password = 'admin';
        $demoAdmin->save();
        $adminPermission = Permission::firstOrCreate(
            ['name' => 'admin'],
            [
                'name' => 'admin',
                'group' => 'admin',
            ],
        );
        $demoAdmin->permissions()->attach($adminPermission->id);

        $userRole = Role::where('default', true)->first();
        $demoAdmin->roles()->attach($userRole->id);

        $admin = User::create([
            'email' => config('app.demo_email'),
            'password' => config('app.demo_password'),
        ]);
        $admin->permissions()->attach($adminPermission->id);
        $admin->roles()->attach($userRole->id);
    }

    private function attachTagsToTracks(Collection $taggables)
    {
        $pivots = collect($taggables)
            ->map(function ($taggable) {
                return $this->tags->map(function ($tag) use ($taggable) {
                    return [
                        'tag_id' => $tag->id,
                        'taggable_type' => $taggable['model_type'],
                        'taggable_id' => $taggable['id'],
                    ];
                });
            })
            ->flatten(1);
        $this->upsert($pivots, 'taggables');
    }
}
