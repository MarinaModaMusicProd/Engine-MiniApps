<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use Common\Billing\Models\Product;
use Common\Core\BaseController;

class LandingPageController extends BaseController
{
    public function __invoke()
    {
        return $this->renderClientOrApi([
            'pageName' => 'landing-page',
            'data' => self::getData(),
        ]);
    }

    public static function getData()
    {
        $channels = collect(settings('landingPage.sections'))
            ->filter(fn($s) => isset($s['channelId']))
            ->map(function ($s) {
                $channel = Channel::find($s['channelId']);
                if ($channel) {
                    $channel->loadContent(['perPage' => 10]);
                }
                return $channel;
            })
            ->filter()
            ->values();

        return [
            'loader' => 'landingPage',
            'products' => Product::with(['permissions', 'prices'])
                ->limit(15)
                ->orderBy('position', 'asc')
                ->get(),
            'sections' => settings('landingPage.sections'),
            'channels' => $channels,
        ];
    }
}
