<?php

namespace Common\Admin;

use Common\Core\BaseController;
use Common\Logging\Schedule\ScheduleLogItem;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

class SiteAlertsController extends BaseController
{
    public function __construct()
    {
        $this->middleware('isAdmin');
    }

    public function index()
    {
        $alerts = [];

        if (!config('app.demo')) {
            if (!ScheduleLogItem::scheduleRanInLast30Minutes()) {
                $alerts[] = [
                    'id' => 'cronNotSetup',
                    'title' => 'There is an issue with CRON schedule',
                    'severity' => 'error',
                    'description' =>
                        'The CRON schedule has not run in the last 30 minutes. If you did not set it up yet, see the documentation <a class="underline font-semibold" target="_blank" href="https://support.vebto.com/hc/articles/21/23/169/automated-tasks-cron-jobs">here</a>.',
                ];
            }

            $moduleLicenseNotActivated = collect(config('modules', []))->some(
                fn($config) => !Arr::get($config, 'built_in') &&
                    Arr::get($config, 'installed') &&
                    !Arr::get($config, 'envato_purchase_code'),
            );

            if (
                !config('app.envato_purchase_code') ||
                $moduleLicenseNotActivated
            ) {
                $alerts[] = [
                    'id' => 'envatoPurchaseCodeNotSet',
                    'title' => 'License is not activated',
                    'severity' => 'error',
                    'description' =>
                        'Active your license to enable automatic updates and other functionality. <a class="underline font-semibold" href="' .
                        url('admin/settings/system?tab=license') .
                        '">Activate license</a>.',
                ];
            }

            $latestVersion = Cache::get('app_latest_version');
            if (
                $latestVersion &&
                version_compare(config('app.version'), $latestVersion) < 0
            ) {
                $alerts[] = [
                    'id' => 'updateAvailable',
                    'title' => 'Update available',
                    'severity' => 'info',
                    'description' =>
                        'A new update (' .
                        $latestVersion .
                        ') is available. Please visit <a class="underline font-semibold" href="' .
                        url('admin/settings/system?tab=updates') .
                        '">updates page</a> to install the latest version.',
                ];
            }
        }

        return $this->success([
            'alerts' => $alerts,
        ]);
    }
}
