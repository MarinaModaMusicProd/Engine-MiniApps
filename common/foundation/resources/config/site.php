<?php

return [
    'remote_file_visibility' => env('REMOTE_FILE_VISIBILITY', 'private'),
    'disable_thumbnail_creation' => env('DISABLE_THUMBNAIL_CREATION', false),
    'use_presigned_s3_urls' => env('USE_PRESIGNED_S3_URLS', true),
    'static_file_delivery' => env('STATIC_FILE_DELIVERY', null),
    'uploads_disk_driver' => env('UPLOADS_DISK_DRIVER', 'local'),
    'public_disk_driver' => env('PUBLIC_DISK_DRIVER', 'local'),
    'file_preview_endpoint' => env('FILE_PREVIEW_ENDPOINT'),
    'version' => env('APP_VERSION'),
    'demo' => env('IS_DEMO_SITE', false),
    'disable_update_auth' => env('DISABLE_UPDATE_AUTH', false),
    'enable_contact_page' => env('ENABLE_CONTACT_PAGE', false),
    'billing_integrated' => env('BILLING_ENABLED', false),
    'workspaces_integrated' => env('WORKSPACES_ENABLED', false),
    'notifications_integrated' => env('NOTIFICATIONS_ENABLED', false),
    'notif_subs_integrated' => env('NOTIF_SUBS_ENABLED', false),
    'api_integrated' => env('API_INTEGRATED', false),
    'enable_custom_domains' => env('ENABLE_CUSTOM_DOMAINS', false),
    'dynamic_app_url' => env('DYNAMIC_APP_URL', true),
    'hide_docs_buttons' => env('HIDE_DOCS_BUTTONS', false),
    'verify_paypal_webhook' => env('VERIFY_PAYPAL_WEBHOOK', false),
    'has_mobile_app' => env('HAS_MOBILE_APP', false),
    'scout_mysql_mode' => env('SCOUT_MYSQL_MODE', 'extended'),
    'uploads_disable_tus' => env('UPLOADS_DISABLE_TUS'),
    'uploads_tus_method' => env('UPLOADS_TUS_METHOD'),
    'simulated_connection' => env('SIMULATED_CONNECTION', false),
    'disable_scout_auto_sync' => env('DISABLE_SCOUT_AUTO_SYNC', false),
    'ssr_enabled' => env('SSR_ENABLED', false),
    'ssr_url' => env('SSR_URL', 'http://127.0.0.1:13714'),
    'disable_csrf' => env('DISABLE_CSRF', false),
    'demo_password' => env('DEMO_ADMIN_PASSWORD'),
    'installed' => env('INSTALLED', false),
];
