<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use Common\Billing\Models\Product;
use Common\Core\Controllers\HomeController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class AppHomeController extends HomeController
{
    public function __invoke()
    {
        if (
            Str::startsWith(settings('homepage.type'), 'channel') ||
            (Auth::check() && settings('homepage.type') === 'landingPage')
        ) {
            return app(FallbackRouteController::class)->renderChannel(
                settings('homepage.value'),
            );
        } else {
            return app(LandingPageController::class)->__invoke();
        }
    }
}
