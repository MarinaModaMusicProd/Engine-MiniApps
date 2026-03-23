<?php

return [
    'channels' => [
        'remoteApiErrors' => [
            'driver' => 'daily',
            'path' => storage_path('logs/remote-api-errors.log'),
            'level' => 'error',
            'days' => 30,
        ],
    ],
];
