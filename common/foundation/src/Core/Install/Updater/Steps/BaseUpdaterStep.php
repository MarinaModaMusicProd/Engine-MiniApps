<?php namespace Common\Core\Install\Updater\Steps;

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use RecursiveTreeIterator;
use Throwable;

abstract class BaseUpdaterStep
{
    protected readonly string $BASE_PATH;

    public function __construct()
    {
        $this->BASE_PATH = base_path('');
    }

    protected function increasePhpLimits(): void
    {
        @ini_set('memory_limit', '-1');
        @set_time_limit(0);
    }

    public function event(
        UpdaterStepName $step,
        UpdaterStepStatus $status,
        ?array $context = [],
    ) {
        $message = match ($step) {
            UpdaterStepName::PREPARING => 'Preparing to update',
            UpdaterStepName::DOWNLOADING => 'Downloading update',
            UpdaterStepName::EXTRACTING => 'Extracting update',
            UpdaterStepName::MOVING_NEW_FILES => 'Copying new files',
            UpdaterStepName::FINALIZING => 'Finalizing update',
        };

        if ($status === UpdaterStepStatus::FAILED) {
            $this->logError($step, $status, $message, $context);
        } else {
            $this->logInfoEvent($step, $status, $message, $context);
        }
    }

    protected function logInfoEvent(
        UpdaterStepName $step,
        UpdaterStepStatus $status,
        string $message,
        ?array $context = [],
    ) {
        try {
            if (!isset($context['progressPercentage'])) {
                $content = sprintf(
                    "[%s] %s: %s\n",
                    date('Y-m-d H:i:s'),
                    $message,
                    $status->value,
                );
                if ($context) {
                    $content .= json_encode($context) . "\n";
                }
                $this->writeToLogFile($content);
            }

            $this->emitEvent($step, $status, $message, $context);
        } catch (Throwable $_e) {
            throw $_e;
        }
    }

    protected function logError(
        UpdaterStepName $step,
        UpdaterStepStatus $status,
        string $message,
        ?array $context = [],
    ) {
        try {
            $timestamp = date('Y-m-d H:i:s');
            $errorMessage = sprintf(
                "[%s] [%s] [%s] %s\n",
                $timestamp,
                $step->value,
                $status->value,
                $message,
            );

            if (isset($context['error'])) {
                if (is_string($context['error'])) {
                    $errorMessage .= sprintf(
                        "error: %s\n\n",
                        $context['error'],
                    );
                } else {
                    $errorMessage .= sprintf(
                        "%s: %s in %s:%d\nStack trace:\n%s\n\n",
                        get_class($context['error']),
                        $context['error']->getMessage(),
                        $context['error']->getFile(),
                        $context['error']->getLine(),
                        $context['error']->getTraceAsString(),
                    );
                }
            }

            $this->writeToLogFile($errorMessage);

            $this->emitEvent($step, $status, $message, [
                'error' => isset($context['error'])
                    ? (is_string($context['error'])
                        ? $context['error']
                        : $context['error']->getMessage())
                    : null,
            ]);
        } catch (Throwable $_e) {
            throw $_e;
        }
    }

    protected function writeToLogFile(string $content)
    {
        $logFile = storage_path('logs/auto-update.log');
        file_put_contents($logFile, $content, FILE_APPEND | LOCK_EX);
    }

    protected function emitEvent(
        UpdaterStepName $step,
        UpdaterStepStatus $status,
        string $message,
        ?array $context = [],
    ): void {
        $this->echoAndFlush(
            json_encode([
                'type' => 'event',
                'step' => $step,
                'status' => $status,
                'message' => $message,
                'context' => $context,
            ]),
        );
    }

    protected function endStream(): void
    {
        $this->echoAndFlush(
            json_encode([
                'type' => 'endStream',
                'message' => '[END]',
            ]),
        );
    }

    protected function echoAndFlush(string $content): void
    {
        if (App::runningInConsole()) {
            // console output
            $content = json_decode($content, true);

            if (
                $content['type'] !== 'event' ||
                isset($content['context']['progressPercentage'])
            ) {
                return;
            }

            $message = $content['message'] . ' - ' . $content['status'];
            if (isset($content['context']['error'])) {
                $message .= ': ' . $content['context']['error'];
            }
            echo $message . "\n";
        } else {
            // server-sent events for browser
            echo "event: message\n";
            echo 'data: ' . $content;
            echo "\n\n";
        }

        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }

    protected function getAllFiles(string $path): array
    {
        $directoryIterator = new RecursiveDirectoryIterator(
            $path,
            RecursiveDirectoryIterator::SKIP_DOTS,
        );

        $iterator = new RecursiveIteratorIterator(
            $directoryIterator,
            RecursiveIteratorIterator::LEAVES_ONLY,
        );

        File::directories($path);

        $files = [];
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $files[] = $file->getPathname();
            }
        }

        return $files;
    }

    protected function getFiles(string $path): array
    {
        $directoryIterator = new RecursiveDirectoryIterator(
            $path,
            RecursiveDirectoryIterator::SKIP_DOTS,
        );

        $files = [];
        foreach ($directoryIterator as $spl) {
            if ($spl->isFile()) {
                $files[] = $spl->getPathname();
            }
        }
        return $files;
    }

    protected function getDirectories(string $path): array
    {
        $directoryIterator = new RecursiveDirectoryIterator(
            $path,
            RecursiveDirectoryIterator::SKIP_DOTS,
        );

        $directories = [];
        foreach ($directoryIterator as $spl) {
            if ($spl->isDir()) {
                $directories[] = $spl->getPathname();
            }
        }
        return $directories;
    }

    protected function getAllDirectories(string $path): array
    {
        $dirIterator = new RecursiveDirectoryIterator(
            $path,
            RecursiveDirectoryIterator::SKIP_DOTS,
        );

        $iterator = new RecursiveIteratorIterator(
            $dirIterator,
            RecursiveIteratorIterator::SELF_FIRST,
        );

        $directories = [];
        foreach ($iterator as $fileinfo) {
            // Check if the current item is a directory
            if ($fileinfo->isDir()) {
                // Add the directory's full path to our array
                $directories[] = $fileinfo->getRealPath();
            }
        }

        return $directories;
    }

    protected function basePath(?string $path = null): string
    {
        $fullPath = $this->BASE_PATH;

        if ($path) {
            $fullPath .= '/' . trim($path, '/');
        }

        return $fullPath;
    }

    protected function ensureDirectoryExists(string $path): void
    {
        if (!is_dir($path)) {
            mkdir($path, 0755, true);
        }
    }
}
