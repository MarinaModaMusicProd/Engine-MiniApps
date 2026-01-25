<?php namespace Common\Core\Install\Updater\Steps;

use Illuminate\Support\Facades\File;
use Throwable;

class PrepareStep extends BaseUpdaterStep
{
    public function execute(array $foldersToCheck): bool
    {
        $this->increasePhpLimits();

        $this->event(UpdaterStepName::PREPARING, UpdaterStepStatus::ACTIVE);

        try {
            // make sure base path is writable, otherwise won't be
            // able to delete child directories or move new files
            $pathsToCheck = [...$foldersToCheck, $this->BASE_PATH];

            foreach ($pathsToCheck as $path) {
                if (!is_writable($path)) {
                    @chmod($path, 0755);

                    if (!is_writable($path)) {
                        $this->event(
                            UpdaterStepName::PREPARING,
                            UpdaterStepStatus::FAILED,
                            [
                                'error' => "Could not make '$path' folder writable, try to apply 0755 permissions manually.",
                            ],
                        );
                        return false;
                    }
                }
            }

            File::deleteDirectory(storage_path('app/active-update'));
            $this->ensureDirectoryExists(storage_path('app/active-update'));
            File::delete(storage_path('app/logs/auto-update.log'));

            $this->event(
                UpdaterStepName::PREPARING,
                UpdaterStepStatus::COMPLETED,
            );

            return true;
        } catch (Throwable $e) {
            $this->event(
                UpdaterStepName::PREPARING,
                UpdaterStepStatus::FAILED,
                [
                    'error' => $e,
                ],
            );
        }

        return false;
    }
}
