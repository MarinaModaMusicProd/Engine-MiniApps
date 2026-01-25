<?php namespace Common\Core\Install\Updater\Steps;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Throwable;

class DownloadUpdateStep extends BaseUpdaterStep
{
    public function execute(string $purchaseCode): bool
    {
        $this->increasePhpLimits();

        $this->event(UpdaterStepName::DOWNLOADING, UpdaterStepStatus::ACTIVE);

        // get download url
        try {
            $downloadUrlResponse = Http::throw()
                ->acceptJson()
                ->post(
                    'https://support.vebto.com/envato/updates/get-download-url',
                    [
                        'purchase_code' => $purchaseCode,
                    ],
                )
                ->json();
        } catch (Throwable $e) {
            $this->event(
                UpdaterStepName::DOWNLOADING,
                UpdaterStepStatus::FAILED,
                [
                    'error' => $e,
                ],
            );
            return false;
        }

        $downloadPath = storage_path('app/active-update/update.zip');

        try {
            $this->ensureDirectoryExists(dirname($downloadPath));

            $localStream = fopen($downloadPath, 'w');

            $prevPercentage = 0;
            Http::withOptions([
                'sink' => $localStream,
                'progress' => function ($total, $downloaded) use (
                    &$prevPercentage,
                ) {
                    if ($total > 0) {
                        $percentage = round(($downloaded / $total) * 100);

                        if ($percentage > $prevPercentage) {
                            $this->event(
                                UpdaterStepName::DOWNLOADING,
                                UpdaterStepStatus::ACTIVE,
                                [
                                    'progressPercentage' => $percentage,
                                ],
                            );
                        }

                        $prevPercentage = $percentage;
                    }
                },
            ])
                ->timeout(300)
                ->throw()
                ->get($downloadUrlResponse['download_url']);

            if (file_exists($downloadPath)) {
                $this->event(
                    UpdaterStepName::DOWNLOADING,
                    UpdaterStepStatus::COMPLETED,
                );
                return true;
            }
        } catch (Throwable $e) {
            File::delete($downloadPath);
            $this->event(
                UpdaterStepName::DOWNLOADING,
                UpdaterStepStatus::FAILED,
                [
                    'error' => $e,
                ],
            );
        }

        return false;
    }
}
