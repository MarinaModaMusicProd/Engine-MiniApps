<?php

return [
    'positions' => array_filter([
        [
            'name' => 'sidebar-primary',
            'label' => 'Sidebar primary',
            'route' => '/',
        ],
        [
            'name' => 'sidebar-secondary',
            'label' => 'Sidebar secondary',
            'route' => '/',
        ],
        [
            'name' => 'mobile-bottom',
            'label' => 'Mobile bottom',
            'route' => '/',
        ],
        [
            'name' => 'landing-page-navbar',
            'label' => 'Landing page navbar',
            'route' => '/?forceHomepage=landing',
        ],
    ]),
    'available_routes' => [
        '/upload',
        '/search',
        '/library',
        '/library/songs',
        '/library/albums',
        '/library/artists',
        '/library/downloads',
        '/library/history',
        '/admin/upload',
        '/admin/channels',
        '/admin/artists',
        '/admin/albums',
        '/admin/tracks',
        '/admin/genres',
        '/admin/lyrics',
        '/admin/playlists',
        '/admin/backstage-requests',
        '/admin/comments',
        '/backstage/requests',
    ],
];
