<?php

namespace Common\Core\Install\Commands;

use Common\Core\Install\Updater\InstallOrUpdateModule;
use Common\Core\Install\Updater\UpdateApp;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;

class UpdateAppCommand extends Command
{
    protected $signature = 'app:update';

    public function handle(): int
    {
        $moduleNames = ['app'];
        foreach (config('modules') as $moduleName => $config) {
            if (
                Arr::get($config, 'installed') &&
                !Arr::get($config, 'built_in') &&
                Arr::get($config, 'envato_purchase_code')
            ) {
                $moduleNames[] = $moduleName;
            }
        }

        foreach ($moduleNames as $name) {
            $this->info("Updating $name...");
            $success = $this->runUpdate($name);
            if (!$success) {
                $this->error("Failed to update {$name}");
                return Command::FAILURE;
            }
        }

        $this->info('App updated successfully');
        return Command::SUCCESS;
    }

    protected function runUpdate(string $name): bool
    {
        if ($name === 'app') {
            return (new UpdateApp())->execute();
        } else {
            return (new InstallOrUpdateModule($name))->execute();
        }
    }
}
