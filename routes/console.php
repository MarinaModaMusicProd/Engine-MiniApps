<?php

use App\Console\Commands\ResetDemoAdminAccount;
use App\Console\Commands\SeedSampleData;
use Common\Channels\UpdateAllChannelsContent;
use Illuminate\Support\Facades\Schedule;

Schedule::command(UpdateAllChannelsContent::class)
    ->dailyAt('03:20')
    ->withoutOverlapping();

if (config('app.demo')) {
    Schedule::command(ResetDemoAdminAccount::class)
        ->dailyAt('03:30')
        ->withoutOverlapping();

    if (str_contains(config('app.url'), 'bemusic.2')) {
        Schedule::command(SeedSampleData::class)
            ->weeklyOn(6, '1:30');
    }
}
