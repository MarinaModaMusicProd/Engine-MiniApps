<?php

return [
    'roles' => [
        [
            'name' => 'Users',
            'internal' => true,
            'default' => true,
            'type' => 'users',
            'permissions' => [
                'music.view',
                'music.embed',
                'music.play',
                'music.offline',
                'lyrics.view',
                'users.view',
                'playlists.create',
                'playlists.view',
                'comments.view',
                'comments.create',
                'backstageRequests.create',
            ],
        ],
        [
            'name' => 'Guests',
            'internal' => true,
            'guests' => true,
            'type' => 'users',
            'permissions' => [
                'music.view',
                'music.embed',
                'music.play',
                'music.offline',
                'lyrics.view',
                'users.view',
                'playlists.view',
                'comments.view',
            ],
        ],
        [
            'name' => 'Artists',
            'internal' => true,
            'extraColumns' => [
                [
                    'name' => 'artists',
                    'value' => true,
                ],
            ],
            'type' => 'users',
            'description' =>
                'Role assigned to a user when their "become artist request" is approved.',
            'permissions' => [
                [
                    'name' => 'music.create',
                    'restrictions' => [
                        'minutes' => 60,
                    ],
                ],
            ],
        ],
    ],
    'all' => [
        'Music' => [
            [
                'name' => 'music.view',
                'display_name' => 'View music',
                'role_types' => ['users'],
                'description' =>
                    'Allows viewing of music content on the site (tracks, albums, artists, channels etc.)',
            ],
            [
                'name' => 'music.play',
                'display_name' => 'Play music',
                'role_types' => ['users'],
                'description' =>
                    'Allows playback of music and video on the site.',
            ],
            [
                'name' => 'music.download',
                'display_name' => 'Download music',
                'role_types' => ['users'],
                'description' =>
                    'Allows download of music and video on the site.',
            ],
            [
                'name' => 'music.offline',
                'display_name' => 'Offline music playback',
                'role_types' => ['users'],
                'description' =>
                    'Allows making music available for offline listening.',
            ],
            [
                'name' => 'music.embed',
                'display_name' => 'Embed code',
                'role_types' => ['users'],
                'description' =>
                    'Allows getting embed code for tracks, albums and playlists for external sites.',
            ],
            [
                'name' => 'music.create',
                'display_name' => 'Add and upload music',
                'role_types' => ['users'],
                'description' =>
                    'Allows uploading and creating new tracks and albums on the site.',
                'restrictions' => [
                    [
                        'name' => 'minutes',
                        'display_name' => 'Minutes',
                        'type' => 'number',
                        'description' =>
                            'How many minutes all user tracks are allowed to take up. Leave empty for unlimited.',
                    ],
                    [
                        'name' => 'artist_selection',
                        'display_name' => 'Artist selection',
                        'type' => 'bool',
                        'description' =>
                            'Allows attaching track or album to any artist that exists on the site, instead of only the ones managed by current user.',
                    ],
                ],
            ],
        ],

        'Playlists' => [
            [
                'name' => 'playlists.view',
                'display_name' => 'View playlists',
                'role_types' => ['users'],
                'description' =>
                    'Allow viewing and searching for playlists marked as public.',
            ],
            [
                'name' => 'playlists.create',
                'display_name' => 'Create playlists',
                'role_types' => ['users'],
                'description' => 'Allow creating new playlists.',
            ],
        ],

        'Comments' => [
            [
                'name' => 'comments.view',
                'display_name' => 'View comments',
                'role_types' => ['users'],
                'description' => 'Allow viewing public comments on the site.',
            ],
            [
                'name' => 'comments.create',
                'display_name' => 'Create comments',
                'role_types' => ['users'],
                'description' =>
                    'Allow posting comments on tracks, albums, playlists and other content.',
            ],
        ],

        'Backstage' => [
            [
                'name' => 'backstageRequests.create',
                'display_name' => 'Create backstage requests',
                'role_types' => ['users'],
                'description' => 'Allow users to create backstage requests.',
            ],
        ],

        'REST API' => [
            [
                'name' => 'api.access',
                'display_name' => 'REST API',
                'role_types' => ['users'],
                'description' =>
                    'Allow usage of REST API and accessing API section in account settings page.',
            ],
        ],

        'Admin' => [
            [
                'name' => 'admin.access',
                'display_name' => 'Access admin area',
                'role_types' => ['users'],
                'description' =>
                    'Required in order to access any admin area page.',
            ],
            [
                'name' => 'admin',
                'display_name' => 'Super admin',
                'role_types' => ['users'],
                'description' => 'Gives full permissions.',
            ],
            [
                'name' => 'reports.view',
                'display_name' => 'View reports',
                'role_types' => ['users'],
                'description' => 'Allow viewing reports.',
            ],
            [
                'name' => 'settings.update',
                'display_name' => 'Manage settings',
                'role_types' => ['users'],
                'description' => 'Allow settings management from admin area.',
            ],
            [
                'name' => 'roles.update',
                'display_name' => 'Role management',
                'role_types' => ['users'],
                'description' => 'Allow role management from admin area.',
            ],
            [
                'name' => 'subscriptions.update',
                'display_name' => 'Manage subscriptions',
                'description' =>
                    'Allow subscription and plan management from admin area.',
                'role_types' => ['users'],
            ],
            [
                'name' => 'localizations.update',
                'display_name' => 'Manage localizations',
                'description' =>
                    'Allow localization management from admin area.',
                'role_types' => ['users'],
            ],
            [
                'name' => 'users.update',
                'display_name' => 'Manage users',
                'role_types' => ['users'],
                'description' => 'Allow user management from admin area.',
            ],
            [
                'name' => 'files.update',
                'display_name' => 'Manage files',
                'role_types' => ['users'],
                'description' => 'Allow file management from admin area.',
            ],
            [
                'name' => 'tags.update',
                'display_name' => 'Manage tags',
                'description' => 'Allow tag management from admin area.',
                'role_types' => ['users'],
            ],
            [
                'name' => 'music.update',
                'display_name' => 'Manage music',
                'description' =>
                    'Allow full management of all music from admin area and backstage. This includes artists, albums, tracks and related metadata like genres and lyrics.',
                'role_types' => ['users'],
            ],
            [
                'name' => 'playlists.update',
                'display_name' => 'Manage playlists',
                'description' => 'Allow playlist management from admin area.',
                'role_types' => ['users'],
            ],
            [
                'name' => 'comments.update',
                'display_name' => 'Manage comments',
                'description' => 'Allow managing comments admin area.',
                'role_types' => ['users'],
            ],
            [
                'name' => 'channels.update',
                'display_name' => 'Manage channels',
                'description' => 'Allow channel management from admin area.',
                'role_types' => ['users'],
            ],
            [
                'name' => 'backstageRequests.update',
                'display_name' => 'Manage backstage requests',
                'description' =>
                    'Allow backstage request management from admin area.',
                'role_types' => ['users'],
            ],
        ],
    ],
];
