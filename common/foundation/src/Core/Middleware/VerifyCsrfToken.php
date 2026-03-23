<?php

namespace Common\Core\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as LaravelVerifyCsrfToken;
use Illuminate\Http\Request;

class VerifyCsrfToken extends LaravelVerifyCsrfToken
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        'csrf-token',
        'auth/login',
        'auth/register',
        '*broadcasting/auth',
        'search-term',
        '*/visits/*/change-status',

        'players/tracks',
        '*/tracks/plays/*/log',
        'youtube/log-client-error',
    ];

    /**
     * Determine if the request has a URI/Domain that should pass through CSRF verification.
     *
     * @param  Request  $request
     * @return bool
     */
    protected function inExceptArray($request)
    {
        if (config('app.disable_csrf')) {
            return true;
        }

        return parent::inExceptArray($request);
    }

    protected function addCookieToResponse($request, $response)
    {
        // don't add cookie if session is set to null
        // (belink needs to disable laravel headers for 301 redirect)
        if (config('session.driver') === null) {
            return $response;
        }

        return parent::addCookieToResponse($request, $response);
    }
}
