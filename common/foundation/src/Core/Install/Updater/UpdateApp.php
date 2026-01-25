<?php namespace Common\Core\Install\Updater;

use Common\Core\Install\Updater\Steps\DownloadUpdateStep;
use Common\Core\Install\Updater\Steps\ExtractUpdateStep;
use Common\Core\Install\Updater\Steps\FinalizeUpdateStep;
use Common\Core\Install\Updater\Steps\MoveNewFilesStep;
use Common\Core\Install\Updater\Steps\PrepareStep;
use Common\Core\Install\Updater\Steps\UpdaterStepName;
use Common\Core\Install\Updater\Steps\UpdaterStepStatus;

class UpdateApp
{
    protected array $foldersToDelete = [
        'app',
        'bootstrap',
        'common',
        'config',
        'database',
        'public/build',
        'public/vendor',
        'resources',
        'routes',
        'tests',
        'vendor',
    ];

    public function __construct()
    {
        $this->foldersToDelete = array_map(
            fn($folder) => base_path($folder),
            $this->foldersToDelete,
        );

        if (config('modules') !== null) {
            $this->foldersToDelete[] = base_path('modules');
        }
    }

    public function execute(?array $steps = null): bool
    {
        if (!config('app.envato_purchase_code')) {
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
            ? array_map(
                fn(string $step) => UpdaterStepName::from($step),
                $steps,
            )
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
        return (new PrepareStep())->execute(
            array_filter(
                $this->foldersToDelete,
                fn($folder) => file_exists($folder),
            ),
        );
    }

    protected function downloadUpdate(): string|null
    {
        return (new DownloadUpdateStep())->execute(
            config('app.envato_purchase_code'),
        );
    }

    protected function extractUpdate(): bool
    {
        return (new ExtractUpdateStep())->execute(
            storage_path('app/active-update/update.zip'),
        );
    }

    protected function moveNewFiles(): bool
    {
        return (new MoveNewFilesStep(
            source: storage_path('app/active-update/extracted/website'),
            destination: base_path(),
            destinationDirsToCleanAbsolute: $this->foldersToDelete,
        ))->execute();
    }

    protected function finalizeUpdate(): bool
    {
        return (new FinalizeUpdateStep())->execute();
    }
}
