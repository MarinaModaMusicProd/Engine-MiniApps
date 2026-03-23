<?php

return [
    'scout_mysql_mode' => env('SCOUT_MYSQL_MODE', 'extended'),
    'disable_scout_auto_sync' => env('DISABLE_SCOUT_AUTO_SYNC', false),

    'meilisearch' => [
        'host' => env('MEILISEARCH_HOST', 'http://localhost:7700'),
        'key' => env('MEILISEARCH_KEY', null),
    ],

    'tntsearch' => [
        'storage' => storage_path('tntsearch'),
        'fuzziness' => env('TNTSEARCH_FUZZINESS', false),
        'fuzzy' => [
            'prefix_length' => 2,
            'max_expansions' => 50,
            'distance' => 2,
            'no_limit' => true,
        ],
        'asYouType' => false,
        'searchBoolean' => env('TNTSEARCH_BOOLEAN', false),
        'maxDocs' => env('TNTSEARCH_MAX_DOCS', 500),
    ],
];
