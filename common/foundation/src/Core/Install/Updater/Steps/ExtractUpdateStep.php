<?php namespace Common\Core\Install\Updater\Steps;

use Throwable;
use ZipArchive;

class ExtractUpdateStep extends BaseUpdaterStep
{
    public function execute(
        string $downloadPath,
        ?string $moduleName = null,
    ): bool {
        $this->increasePhpLimits();

        $this->event(UpdaterStepName::EXTRACTING, UpdaterStepStatus::ACTIVE);

        try {
            $path = storage_path('app/active-update/extracted');
            $zip = new ZipArchive();
            $zip->open($downloadPath);
            $zip->extractTo($path);
            $zip->close();

            // main app files are in website.zip inside the parent zip
            if (!$moduleName) {
                $zip = new ZipArchive();
                $zip->open("$path/website.zip");
                $zip->extractTo("$path/website");
                $zip->close();
            }

            $this->event(
                UpdaterStepName::EXTRACTING,
                UpdaterStepStatus::COMPLETED,
            );

            return true;
        } catch (Throwable $e) {
            $this->event(
                UpdaterStepName::EXTRACTING,
                UpdaterStepStatus::FAILED,
                [
                    'error' => $e,
                ],
            );
        }

        return false;
    }
}
