<?php namespace Common\Core\Install\Updater\Steps;

use Throwable;

class MoveNewFilesStep extends BaseUpdaterStep
{
    protected array $test = [];

    public function __construct(
        protected string $source,
        protected string $destination,
        protected array $destinationDirsToCleanAbsolute = [],
    ) {
        parent::__construct();
    }

    public function execute(): bool
    {
        $this->increasePhpLimits();

        $this->event(
            UpdaterStepName::MOVING_NEW_FILES,
            UpdaterStepStatus::ACTIVE,
        );

        if (config('app.env') !== 'local') {
            try {
                // "loopDirectory" will only proccess subdirs (recursively),
                // need to process files at root of main directory as well
                $this->loopDirectory($this->source);
                $this->processDirectory($this->source, recursive: false);
            } catch (Throwable $e) {
                $this->event(
                    UpdaterStepName::MOVING_NEW_FILES,
                    UpdaterStepStatus::FAILED,
                    [
                        'error' => $e,
                    ],
                );
                return false;
            }
        }

        $this->event(
            UpdaterStepName::MOVING_NEW_FILES,
            UpdaterStepStatus::COMPLETED,
        );

        return true;
    }

    protected function loopDirectory(string $dir)
    {
        $dirs = $this->getDirectories($dir);

        foreach ($dirs as $subdir) {
            if (basename($subdir) === 'vendor') {
                // "loopDirectory" will only proccess subdirs (recursively),
                // need to process files at root of vendor directory as well
                $this->loopDirectory($subdir);
                $this->processDirectory($subdir, recursive: false);
            } else {
                $this->processDirectory($subdir);
            }
        }
    }

    protected function processDirectory(
        string $sourceDirAbsolute,
        bool $recursive = true,
    ): void {
        $sourceFiles = $recursive
            ? $this->getAllFiles($sourceDirAbsolute)
            : $this->getFiles($sourceDirAbsolute);

        // move files to destination
        $sourceFilesRelative = [];
        foreach ($sourceFiles as $sourceFileAbsolute) {
            $fileRelative = trim(
                str_replace($this->source, '', $sourceFileAbsolute),
                DIRECTORY_SEPARATOR,
            );
            $sourceFilesRelative[] = $fileRelative;
            $destinationFileAbsolute = "$this->destination/$fileRelative";

            $this->ensureDirectoryExists(dirname($destinationFileAbsolute));

            rename($sourceFileAbsolute, $destinationFileAbsolute);
        }

        // clean up old files
        $relativeDir = trim(
            str_replace($this->source, '', $sourceDirAbsolute),
            DIRECTORY_SEPARATOR,
        );
        $destinationDirAbsolute = "$this->destination/$relativeDir";

        $destinationFilesAbsolute = [];
        if (file_exists($destinationDirAbsolute)) {
            $destinationFilesAbsolute = $recursive
                ? $this->getAllFiles($destinationDirAbsolute)
                : $this->getFiles($destinationDirAbsolute);
        }

        foreach ($destinationFilesAbsolute as $destinationFileAbsolute) {
            if (
                $this->shouldDeleteFile(
                    $destinationFileAbsolute,
                    $sourceFilesRelative,
                )
            ) {
                $this->test[] = $destinationFileAbsolute;
                unlink($destinationFileAbsolute);
            }
        }

        // delete empty directories in "$to/$dir"
        $destinationSubDirsAbsolute = $recursive
            ? $this->getAllDirectories($destinationDirAbsolute)
            : $this->getDirectories($destinationDirAbsolute);
        foreach ($destinationSubDirsAbsolute as $destinationSubDirAbsolute) {
            if (count($this->getAllFiles($destinationSubDirAbsolute)) === 0) {
                @rmdir($destinationSubDirAbsolute);
            }
        }
    }

    protected function shouldDeleteFile(
        string $destinationFileAbsolute,
        array $sourceFilesRelative,
    ): bool {
        // don't delete .json language files in resources/lang directory
        if (
            preg_match(
                '/resources\/lang\/[a-z]{2}\.json/',
                $destinationFileAbsolute,
            ) === 1
        ) {
            return false;
        }

        foreach (
            $this->destinationDirsToCleanAbsolute
            as $destinationDirAbsolute
        ) {
            if (
                str_starts_with(
                    $destinationFileAbsolute,
                    $destinationDirAbsolute,
                )
            ) {
                $fileRelative = trim(
                    str_replace(
                        $this->destination,
                        '',
                        $destinationFileAbsolute,
                    ),
                    DIRECTORY_SEPARATOR,
                );
                if (!in_array($fileRelative, $sourceFilesRelative)) {
                    return true;
                }
            }
        }

        return false;
    }
}
