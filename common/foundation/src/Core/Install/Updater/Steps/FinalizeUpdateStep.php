<?php namespace Common\Core\Install\Updater\Steps;

use Common\Core\Install\UpdateActions;
use Illuminate\Support\Facades\File;
use Throwable;

class FinalizeUpdateStep extends BaseUpdaterStep
{
    public function execute(): bool
    {
        $this->increasePhpLimits();

        $this->event(UpdaterStepName::FINALIZING, UpdaterStepStatus::ACTIVE);

        try {
            (new UpdateActions())->execute();
            File::deleteDirectory(storage_path('app/active-update'));
            $this->event(
                UpdaterStepName::FINALIZING,
                UpdaterStepStatus::COMPLETED,
            );
            $this->endStream();
            return true;
        } catch (Throwable $e) {
            $this->event(
                UpdaterStepName::FINALIZING,
                UpdaterStepStatus::FAILED,
                [
                    'error' => $e,
                ],
            );
        }

        return false;
    }
}
