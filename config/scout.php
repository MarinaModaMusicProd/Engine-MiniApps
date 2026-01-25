<?php

use App\Models\Album;
use App\Models\Artist;
use App\Models\Playlist;
use App\Models\Track;

return [
    'meilisearch' => [
        'index-settings' => [
            Artist::class => [],
            Album::class => [],
            Track::class => [],
            Playlist::class => [],
        ],
    ],
];
