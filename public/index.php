<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

use Illuminate\Http\Request;

if (version_compare(PHP_VERSION, '8.2') === -1) {
    exit('You need at least PHP ' . '8.2' . ' to install this application.');
}

define('LARAVEL_START', microtime(true));

if (
    file_exists(
        $maintenance = __DIR__ . '/../storage/framework/maintenance.php',
    )
) {
    require $maintenance;
}

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';

if (!file_exists(__DIR__ . '/../.env')) {
    $app->loadEnvironmentFrom('env.example');
}

$app->handleRequest(Request::capture());
