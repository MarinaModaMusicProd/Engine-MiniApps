<?php

return [
    'wave_storage_disk' => env('WAVE_STORAGE_DISK'),
    'spotify' => [
        'id' => env('SPOTIFY_ID'),
        'secret' => env('SPOTIFY_SECRET'),
        'use_deprecated_api' => env('SPOTIFY_USE_DEPRECATED_API', false),
    ],

    'lastfm' => [
        'key' => env('LASTFM_API_KEY'),
    ],

    'rapidapi' => [
        'key' => env('RAPIDAPI_APP_KEY'),
    ],
];
