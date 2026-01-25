<?php

return [
    // logos
    [
        'name' => 'branding.logo_dark',
        'value' => 'images/logo-dark.svg',
    ],
    [
        'name' => 'branding.logo_light',
        'value' => 'images/logo-light.svg',
    ],

    //homepage
    ['name' => 'homepage.type', 'value' => 'channel'],
    ['name' => 'homepage.value', 'value' => 8],

    //cache
    ['name' => 'cache.report_minutes', 'value' => 60],
    ['name' => 'cache.homepage_days', 'value' => 1],
    ['name' => 'automation.artist_interval', 'value' => 7],

    //providers
    ['name' => 'artist_bio_provider', 'value' => 'wikipedia'],
    ['name' => 'wikipedia_language', 'value' => 'en'],

    //player
    ['name' => 'youtube.suggested_quality', 'value' => 'default'],
    ['name' => 'youtube.region_code', 'value' => 'us'],
    ['name' => 'youtube.search_method', 'value' => 'site'],
    ['name' => 'youtube.store_id', 'value' => false],
    ['name' => 'player.default_volume', 'value' => 30],
    ['name' => 'player.hide_queue', 'value' => false],
    ['name' => 'player.hide_video', 'value' => false],
    ['name' => 'player.hide_video_button', 'value' => false],
    ['name' => 'player.hide_lyrics', 'value' => false],
    ['name' => 'player.lyrics_automate', 'value' => false],
    ['name' => 'player.mobile.auto_open_overlay', 'value' => true],
    ['name' => 'player.enable_download', 'value' => false],
    ['name' => 'player.sort_method', 'value' => 'external'],
    ['name' => 'player.seekbar_type', 'value' => 'line'],
    ['name' => 'player.track_comments', 'value' => false],
    ['name' => 'player.show_upload_btn', 'value' => false],
    ['name' => 'uploads.autoMatch', 'value' => true],
    ['name' => 'player.default_artist_view', 'value' => 'list'],
    ['name' => 'player.enable_repost', 'value' => false],
    [
        'name' => 'artistPage.tabs',
        'value' => json_encode([
            ['id' => 1, 'active' => true],
            ['id' => 2, 'active' => true],
            ['id' => 3, 'active' => true],
            ['id' => 4, 'active' => false],
            ['id' => 5, 'active' => false],
            ['id' => 6, 'active' => false],
        ]),
    ],

    //menus
    [
        'name' => 'menus',
        'value' => json_encode([
            [
                'name' => 'Primary',
                'id' => 'wGixKn',
                'positions' => ['sidebar-primary'],
                'items' => [
                    [
                        'type' => 'route',
                        'label' => 'Home',
                        'action' => '/',
                        'id' => 562,
                    ],
                    [
                        'type' => 'route',
                        'label' => 'New releases',
                        'action' => '/new-releases',
                        'id' => 566,
                    ],
                    [
                        'type' => 'route',
                        'label' => 'Genres',
                        'action' => '/genres',
                        'id' => 134,
                    ],
                    [
                        'type' => 'route',
                        'label' => 'Popular songs',
                        'action' => '/popular-tracks',
                        'id' => 833,
                    ],
                ],
            ],

            [
                'name' => 'Secondary',
                'id' => 'NODtKW',
                'positions' => ['sidebar-secondary'],
                'items' => [
                    [
                        'id' => 878,
                        'type' => 'route',
                        'label' => 'Songs',
                        'action' => '/library/songs',
                    ],
                    [
                        'id' => 574,
                        'type' => 'route',
                        'label' => 'Albums',
                        'action' => '/library/albums',
                    ],
                    [
                        'id' => 933,
                        'type' => 'route',
                        'label' => 'Artists',
                        'action' => '/library/artists',
                    ],
                    [
                        'id' => 775,
                        'type' => 'route',
                        'label' => 'History',
                        'action' => '/library/history',
                    ],
                    [
                        'id' => 776,
                        'type' => 'route',
                        'label' => 'Downloads',
                        'action' => '/library/downloads',
                    ],
                ],
            ],

            [
                'name' => 'Mobile',
                'id' => 'nKRHXG',
                'positions' => ['mobile-bottom'],
                'items' => [
                    [
                        'type' => 'route',
                        'label' => 'Discover',
                        'action' => '/',
                        'id' => 554,
                    ],
                    [
                        'type' => 'route',
                        'label' => 'Search',
                        'action' => '/search',
                        'id' => 849,
                    ],
                    [
                        'type' => 'route',
                        'label' => 'Library',
                        'action' => '/library',
                        'id' => 669,
                    ],
                ],
            ],

            [
                'name' => 'Auth Dropdown',
                'id' => 'h8r6vg',
                'items' => [
                    [
                        'label' => 'Admin area',
                        'id' => 'upm1rv',
                        'action' => '/admin/reports',
                        'type' => 'route',
                        'permissions' => ['admin.access'],
                    ],
                    [
                        'label' => 'Web player',
                        'id' => 'ehj0uk',
                        'action' => '/',
                        'type' => 'route',
                    ],
                    [
                        'label' => 'Account settings',
                        'id' => '6a89z5',
                        'action' => '/account-settings',
                        'type' => 'route',
                    ],
                ],
                'positions' => ['auth-dropdown'],
            ],
            [
                'name' => 'Admin Sidebar',
                'id' => '2d43u1',
                'items' => [
                    [
                        'label' => 'Analytics',
                        'id' => '886nz4',
                        'action' => '/admin/reports',
                        'type' => 'route',
                        'condition' => 'admin',
                        'permissions' => ['admin.access'],
                    ],
                    [
                        'label' => 'Settings',
                        'id' => 'x5k484',
                        'action' => '/admin/settings',
                        'type' => 'route',
                        'permissions' => ['settings.update'],
                    ],
                    [
                        'label' => 'Plans',
                        'id' => '7o42rt',
                        'action' => '/admin/plans',
                        'type' => 'route',
                        'permissions' => ['plans.update'],
                        'settings' => ['billing.enable' => true],
                    ],
                    [
                        'label' => 'Subscriptions',
                        'action' => '/admin/subscriptions',
                        'type' => 'route',
                        'id' => 'sdcb5a',
                        'condition' => 'admin',
                        'permissions' => ['subscriptions.update'],
                        'settings' => ['billing.enable' => true],
                    ],
                    [
                        'label' => 'Users',
                        'action' => '/admin/users',
                        'type' => 'route',
                        'id' => 'fzfb45',
                        'permissions' => ['users.update'],
                    ],
                    [
                        'label' => 'Roles',
                        'action' => '/admin/roles',
                        'type' => 'route',
                        'id' => 'mwdkf0',
                        'permissions' => ['roles.update'],
                    ],
                    [
                        'id' => 'O3I9eJ',
                        'label' => 'Upload',
                        'action' => '/admin/upload',
                        'type' => 'route',
                        'target' => '_self',
                        'permissions' => ['music.create'],
                    ],
                    [
                        'id' => '303113a',
                        'type' => 'route',
                        'label' => 'Channels',
                        'action' => '/admin/channels',
                        'permissions' => ['channels.update'],
                    ],
                    [
                        'id' => 'nVKg0I',
                        'label' => 'Artists',
                        'action' => '/admin/artists',
                        'permissions' => ['artists.update'],
                        'type' => 'route',
                        'target' => '_self',
                    ],
                    [
                        'id' => 'Qq7wh9',
                        'label' => 'Albums',
                        'action' => '/admin/albums',
                        'permissions' => ['albums.update'],
                        'type' => 'route',
                        'target' => '_self',
                    ],
                    [
                        'id' => '9_7Uip',
                        'label' => 'Tracks',
                        'permissions' => ['tracks.update'],
                        'action' => '/admin/tracks',
                        'type' => 'route',
                        'target' => '_self',
                    ],
                    [
                        'id' => '57IFvN',
                        'label' => 'Genres',
                        'permissions' => ['genres.update'],
                        'action' => '/admin/genres',
                        'type' => 'route',
                        'target' => '_self',
                    ],
                    [
                        'id' => '5eGJwT',
                        'label' => 'Lyrics',
                        'permissions' => ['lyrics.update'],
                        'action' => '/admin/lyrics',
                        'type' => 'route',
                        'target' => '_self',
                    ],
                    [
                        'id' => 'zl5XVb',
                        'label' => 'Playlists',
                        'permissions' => ['playlists.update'],
                        'action' => '/admin/playlists',
                        'type' => 'route',
                        'target' => '_self',
                    ],
                    [
                        'id' => 'UXtCU9',
                        'label' => 'Requests',
                        'action' => '/admin/backstage-requests',
                        'permissions' => ['requests.update'],
                        'type' => 'route',
                        'target' => '_self',
                    ],
                    [
                        'id' => '31pLaw',
                        'label' => 'Comments',
                        'action' => '/admin/comments',
                        'permissions' => ['comments.update'],
                        'type' => 'route',
                        'target' => '_self',
                    ],
                    [
                        'label' => 'Pages',
                        'action' => '/admin/custom-pages',
                        'type' => 'route',
                        'id' => '63bwv9',
                        'permissions' => ['custom_pages.update'],
                    ],
                    [
                        'label' => 'Tags',
                        'action' => '/admin/tags',
                        'type' => 'route',
                        'id' => '2x0pzq',
                        'permissions' => ['tags.update'],
                    ],
                    [
                        'label' => 'Files',
                        'action' => '/admin/files',
                        'type' => 'route',
                        'id' => 'vguvti',
                        'permissions' => ['files.update'],
                    ],

                    [
                        'label' => 'Localizations',
                        'action' => '/admin/localizations',
                        'type' => 'route',
                        'id' => 'w91yql',
                        'permissions' => ['localizations.update'],
                    ],

                    [
                        'label' => 'Logs',
                        'action' => '/admin/logs',
                        'type' => 'route',
                        'target' => '_self',
                    ],
                ],
                'positions' => ['admin-sidebar'],
            ],
        ]),
    ],

    // LANDING PAGE
    [
        'name' => 'landingPage',
        'value' => json_encode([
            'sections' => [
                [
                    'name' => 'hero-with-background-image',
                    'title' => 'Amplify Your Sound. Discover the Unheard.',
                    'description' =>
                        'MarinaModa is the ultimate ecosystem for independent creators and passionate listeners. Upload your tracks, build a loyal fanbase, and explore a universe of unfiltered, authentic audio.',
                    'bgColors' => [
                        'opacity' => 0.8,
                        'color1' => '#000000',
                        'color2' => '#527e2c',
                    ],
                    'buttons' => [
                        [
                            'color' => 'primary',
                            'variant' => 'flat',
                            'label' => 'Get Started',
                            'type' => 'route',
                            'action' => '/register',
                        ],
                        [
                            'color' => 'white',
                            'label' => 'Explore',
                            'type' => 'route',
                            'action' => '/discover',
                        ],
                    ],
                    'forceDarkMode' => true,
                    'showAsPanel' => true,
                    'showSearchBarSlot' => true,
                    'image' => [
                        'src' => 'images/landing/header-bg.webp',
                        'width' => '1280',
                        'height' => '853',
                    ],
                ],
                [
                    'name' => 'features-grid',
                    'badge' => 'Built for Creators',
                    'title' => 'Empowering the Next Generation of Sound',
                    'wrapIconsInBg' => true,
                    'iconsOnTop' => true,
                    'features' => [
                        [
                            'title' => 'Lossless Audio Quality',
                            'description' =>
                                'Experience music exactly as the artist intended with our high-fidelity streaming engine.',
                            'icon' => 'highQuality',
                        ],
                        [
                            'title' => 'Real-Time Analytics',
                            'description' =>
                                'Track your growth with instant data on plays, likes, and listener geography.',
                            'icon' => 'analytics',
                        ],
                        [
                            'title' => 'Global Community',
                            'description' =>
                                'Connect with millions of producers, vocalists, and fans from every corner of the globe.',
                            'icon' => 'community',
                        ],
                        [
                            'title' => 'Smart Discovery',
                            'description' =>
                                'Our algorithm pushes underground talent to the forefront, ensuring fresh sounds get heard.',
                            'icon' => 'discover',
                        ],
                        [
                            'title' => 'Custom Profiles',
                            'description' =>
                                'Brand your artist page with custom banners, pinned tracks, and bio links.',
                            'icon' => 'person',
                        ],
                        [
                            'title' => 'Direct Support',
                            'description' =>
                                'A platform built to help fans support the artists they love directly and transparently.',
                            'icon' => 'support',
                        ],
                    ],
                    'maxColumns' => '3',
                    'description' =>
                        'We provide the essential infrastructure to help you launch your music career and find your tribe, offering high-fidelity playback and advanced data for the next generation of sound.',
                ],
                [
                    'name' => 'channel',
                    'title' => 'Hear Tomorrow’s Hits Today',
                    'channelId' => '13',
                    'badge' => 'Fresh Drops',
                    'description' =>
                        'Catch the latest drops as they happen. From bedroom demos to studio masterpieces, explore a real-time feed of new tracks across every genre.',
                ],
                [
                    'name' => 'feature-with-screenshot',
                    'badge' => 'Upload & Grow',
                    'title' => 'Build Your Legacy on MarinaModa',
                    'description' =>
                        'Take full ownership of your career with tools designed to get your music into the ears of people who care. We make publishing your catalog effortless so you can focus entirely on your craft and your audience.',
                    'wrapIconsInBg' => true,
                    'imageSize' => 'lg',
                    'alignLeft' => false,
                    'inPanel' => false,
                    'imagePanel' => false,
                    'forceDarkMode' => false,
                    'features' => [
                        [
                            'title' => 'Instant Publishing',
                            'description' =>
                                'Drag, drop, and go live in seconds. Your track is available to the world the moment you hit publish.',
                            'icon' => 'publish',
                        ],
                        [
                            'title' => 'Deep Insights',
                            'description' =>
                                'Know your audience. See exactly which cities your fans are in and which tracks are spiking in popularity.',
                            'icon' => 'insights',
                        ],
                        [
                            'title' => 'Repost Networks',
                            'description' =>
                                'Gain traction organically. When fans or other artists repost your track, it appears instantly on their followers\' feeds.',
                            'icon' => 'repost',
                        ],
                    ],
                    'image' => [
                        'src' => 'images/landing/artist-page-light.webp',
                        'width' => '3840',
                        'height' => '2160',
                    ],
                ],
                [
                    'name' => 'feature-with-screenshot',
                    'badge' => 'Explore & Connect',
                    'title' => 'Find Your New Obsession',
                    'description' =>
                        'Discover, stream, and share a constantly expanding mix of music from emerging and major artists around the world. MarinaModa goes beyond passive listening—dive into a rabbit hole of remixes, B-sides, and originals to curate your own unique sonic identity.',
                    'features' => [
                        [
                            'title' => 'Curated Daily Feeds',
                            'description' =>
                                'Wake up to a fresh mix of tracks tailored specifically to your listening habits and genre preferences.',
                            'icon' => 'feed',
                        ],
                        [
                            'title' => 'Seamless Playlists',
                            'description' =>
                                'Build the ultimate vibe. Create public playlists to share your taste or keep them private for your personal rotation.',
                            'icon' => 'playlist',
                        ],
                        [
                            'title' => 'Offline Listening',
                            'description' =>
                                'Take the underground with you. Save your favorite tracks and playlists to your device for data-free listening anywhere.',
                            'icon' => 'offline',
                        ],
                    ],
                    'imageSize' => 'lg',
                    'alignLeft' => true,
                    'inPanel' => true,
                    'imagePanel' => false,
                    'forceDarkMode' => true,
                    'image' => [
                        'src' => 'images/landing/home-dark.webp',
                        'width' => '3840',
                        'height' => '2160',
                    ],
                    'wrapIconsInBg' => true,
                ],
                [
                    'name' => 'feature-with-screenshot',
                    'badge' => 'Social Audio',
                    'title' => 'More Than Just a Stream',
                    'description' =>
                        'Music brings people together, and MarinaModa is the town square. We bridge the gap between the booth and the crowd, turning solitary listening into a shared, interactive experience.',
                    'imageSize' => 'sm',
                    'features' => [
                        [
                            'title' => 'Waveform Comments',
                            'description' =>
                                'Leave your mark. Drop comments at specific timestamps on a track to share your reaction to the beat drop or a clever lyric.',
                            'icon' => 'waves',
                        ],
                        // [
                        //     'title' => 'Direct Messaging',
                        //     'description' =>
                        //         'Collaborate and chat. Message artists for collaborations or connect with fellow fans who share your taste.',
                        //     'icon' => 'message',
                        // ],
                        [
                            'title' => 'Live Notifications',
                            'description' =>
                                'Never miss a beat. Get alerted instantly when your favorite artists drop new tracks or announce a show.',
                            'icon' => 'notifications',
                        ],
                    ],
                    'image' => [
                        'src' => 'images/landing/profile-light.webp',
                        'width' => '3840',
                        'height' => '2160',
                    ],
                    'alignLeft' => false,
                    'inPanel' => false,
                    'imagePanel' => false,
                    'forceDarkMode' => false,
                    'wrapIconsInBg' => true,
                ],
                [
                    'name' => 'pricing',
                    'title' => 'Flexible Plans for Every Stage',
                    'description' =>
                        'Whether you are a bedroom producer just starting out or a touring artist with a massive catalog, we have a plan that fits your needs. Start for free and upgrade as you grow.',
                ],
                [
                    'name' => 'cta-simple-centered',
                    'title' => 'Ready to Be Heard?',
                    'description' =>
                        'Join the fastest-growing community of independent artists and tastemakers. Sign up today and start shaping the future of music.',
                    'forceDarkMode' => false,
                    'buttons' => [
                        [
                            'color' => 'primary',
                            'variant' => 'flat',
                            'label' => 'Join MarinaModa for Free',
                            'type' => 'route',
                            'action' => '/login',
                        ],
                    ],
                ],
                [
                    'name' => 'footer',
                ],
            ],
        ]),
    ],
];
