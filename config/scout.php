<?php

use App\Models\Album;
use App\Models\Artist;
use App\Models\Playlist;
use App\Models\Tag;
use App\Models\Track;
use App\Models\User;

return [
    'meilisearch' => [
        'index-settings' => [
            Artist::class => [],
            Album::class => [],
            Track::class => [],
            Playlist::class => [],
            Tag::class => [],
            User::class => [],
        ],
    ],
];
