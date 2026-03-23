<?php

namespace Common\Core\Install\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

class CheckIfUpdateAvailableCommand extends Command
{
    protected $signature = 'update:check';

    public function handle(): int
    {
        try {
            $response = Http::throw()->get(
                'https://support.vebto.com/envato/updates/get-latest-version',
                [
                    'purchase_code' => config('app.envato_purchase_code'),
                ],
            );
        } catch (Throwable $e) {
            $this->info('Could not retrieve latest version.');
            Cache::forget('app_latest_version');
        }

        if (isset($response['latest_version'])) {
            $latestVersion = $response['latest_version'];
            Cache::forever('app_latest_version', $latestVersion);
            if (version_compare(config('app.version'), $latestVersion) < 0) {
                $this->info("Update $latestVersion available");
            } else {
                $this->info('Already on the latest version.');
            }
        }

        return Command::SUCCESS;
    }
}
