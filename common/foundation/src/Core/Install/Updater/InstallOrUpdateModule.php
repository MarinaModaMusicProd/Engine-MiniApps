<?php namespace Common\Core\Install\Updater;

use Common\Core\Install\Updater\Steps\PrepareStep;
use Common\Core\Install\Updater\Steps\DownloadUpdateStep;
use Common\Core\Install\Updater\Steps\ExtractUpdateStep;
use Common\Core\Install\Updater\Steps\FinalizeUpdateStep;
use Common\Core\Install\Updater\Steps\MoveNewFilesStep;
use Common\Core\Install\Updater\Steps\UpdaterStepName;
use Common\Core\Install\Updater\Steps\UpdaterStepStatus;

class InstallOrUpdateModule
{
    public function __construct(protected string $moduleName) {}

    public function execute(?array $steps = null): bool
    {
        if (!config("modules.$this->moduleName.envato_purchase_code")) {
            (new PrepareStep())->event(
                UpdaterStepName::PREPARING,
                UpdaterStepStatus::FAILED,
                [
                    'error' => 'No purchase code found',
                ],
            );
            return false;
        }

        $steps = $steps
            ? array_map(fn($step) => UpdaterStepName::from($step), $steps)
            : UpdaterStepName::cases();

        foreach ($steps as $step) {
            $success = $this->executeStep($step);
            if (!$success) {
                return false;
            }
        }
        return true;
    }

    protected function executeStep(UpdaterStepName $step): bool
    {
        return match ($step) {
            UpdaterStepName::PREPARING => $this->prepareForUpdate(),
            UpdaterStepName::DOWNLOADING => $this->downloadUpdate(),
            UpdaterStepName::EXTRACTING => $this->extractUpdate(),
            UpdaterStepName::MOVING_NEW_FILES => $this->moveNewFiles(),
            UpdaterStepName::FINALIZING => $this->finalizeUpdate(),
        };
    }

    protected function prepareForUpdate(): bool
    {
        return (new PrepareStep())->execute([
            base_path('modules'),
            base_path("modules/$this->moduleName"),
        ]);
    }

    protected function downloadUpdate(): bool
    {
        return (new DownloadUpdateStep())->execute(
            config("modules.$this->moduleName.envato_purchase_code"),
        );
    }

    protected function extractUpdate(): bool
    {
        return (new ExtractUpdateStep())->execute(
            storage_path('app/active-update/update.zip'),
            $this->moduleName,
        );
    }

    protected function moveNewFiles(): bool
    {
        return (new MoveNewFilesStep(
            source: storage_path('app/active-update/extracted'),
            destination: base_path("modules/$this->moduleName"),
            destinationDirsToCleanAbsolute: [
                base_path("modules/$this->moduleName"),
            ],
        ))->execute();
    }

    protected function finalizeUpdate(): bool
    {
        return (new FinalizeUpdateStep())->execute();
    }
}
